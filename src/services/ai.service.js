import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../common/prisma/connect.prisma.js";

export const aiService = {
    async recommendProducts(userPrompt) {
        // 1. Lấy danh sách sản phẩm cơ bản (Thêm category_id để xử lý sort cho fallback)
        const products = await prisma.products.findMany({
            where: { 
                isDeleted: 0,
            },
            select: {
                id: true,
                name: true,
                short_description: true,
                category_id: true, 
                categories: { select: { name: true } }
            }
        });

        if (products.length === 0) return [];

        // 2. Định dạng dữ liệu thành chuỗi Text để nhồi vào Prompt
        const productDataString = products.map(p =>
            `ID: ${p.id} | Tên: ${p.name} | Danh mục: ${p.categories?.name || 'Khác'} | Mô tả: ${p.short_description || 'Không có'}`
        ).join('\n');

        const prompt = `
            Bạn là một trợ lý ảo tư vấn tinh dầu và quà tặng của cửa hàng Memys.
            Dưới đây là danh sách các sản phẩm hiện có:
            ${productDataString}

            Yêu cầu của khách hàng: "${userPrompt}"

            Nhiệm vụ của bạn: Dựa vào yêu cầu trên, hãy phân tích và chọn ra đúng 10 sản phẩm phù hợp nhất.
            BẮT BUỘC CHỈ TRẢ VỀ ĐÚNG 1 MẢNG JSON CHỨA ID CỦA CÁC SẢN PHẨM. KHÔNG VIẾT THÊM BẤT KỲ CÂU CHỮ NÀO KHÁC.
            Ví dụ định dạng trả về hợp lệ: [1, 5, 12, 10, ...]
        `;

        let recommendedIds = [];

        // 3. TRY...CATCH để gọi API, nếu lỗi sẽ tự động dùng Fallback
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Xử lý loại bỏ mã Markdown
            const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            recommendedIds = JSON.parse(cleanJsonStr);

            if (!Array.isArray(recommendedIds) || recommendedIds.length === 0) {
                throw new Error("AI trả về mảng rỗng hoặc định dạng không hợp lệ"); // Ép nhảy xuống catch
            }
            console.log("AI gợi ý thành công:", recommendedIds);

        } catch (error) {
            console.error("Lỗi AI, kích hoạt danh sách NGẪU NHIÊN & ĐẦY ĐỦ DANH MỤC:", error.message);
            
            // LOGIC FALLBACK: Ngẫu nhiên nhưng đầy đủ các loại
            
            // 1. Phân loại sản phẩm vào từng "rổ" (category)
            const productsByCategory = {};
            products.forEach(p => {
                if (!productsByCategory[p.category_id]) {
                    productsByCategory[p.category_id] = [];
                }
                productsByCategory[p.category_id].push(p);
            });

            const random10Products = [];
            const remainingProducts = [];

            // 2. Đi dạo qua từng "rổ", bốc ngẫu nhiên 1 món bỏ vào danh sách chọn
            for (const catId in productsByCategory) {
                // Xáo trộn ngẫu nhiên rổ sản phẩm hiện tại
                const shuffledCat = [...productsByCategory[catId]].sort(() => 0.5 - Math.random());
                
                // Bốc món đầu tiên (đảm bảo category này có mặt)
                if (shuffledCat.length > 0) {
                    random10Products.push(shuffledCat[0]);
                    // Quăng các món còn dư vào một kho chung
                    remainingProducts.push(...shuffledCat.slice(1));
                }
            }

            // 3. Nếu bốc mỗi loại 1 món mà vẫn chưa đủ 10, thì bốc đại thêm từ kho chung
            if (random10Products.length < 10) {
                const needed = 10 - random10Products.length;
                const shuffledRemaining = remainingProducts.sort(() => 0.5 - Math.random());
                random10Products.push(...shuffledRemaining.slice(0, needed));
            }

            const final10Products = random10Products.slice(0, 10);
            
            recommendedIds = final10Products.map(p => p.id);
            
        }

        if (recommendedIds.length === 0) return [];

        // 4. Truy vấn lấy đầy đủ chi tiết của các sản phẩm
        const recommendedProducts = await prisma.products.findMany({
            where: {
                id: { in: recommendedIds },
                isDeleted: 0
            },
            include: {
                categories: true,
                product_quantities: {
                    include: { quantities: true }
                }
            }
        });

        // 5. BƯỚC QUAN TRỌNG: Sắp xếp lại kết quả Prisma theo đúng thứ tự của mảng recommendedIds
        const CATEGORY_ORDER = [6, 1, 2, 3, 4, 5];

        // Tạo map để tra cứu thứ tự nhanh O(1)
        const categoryOrderMap = CATEGORY_ORDER.reduce((acc, catId, index) => {
            acc[catId] = index;
            return acc;
        }, {});

        const sortedFinalProducts = recommendedProducts.sort((a, b) => {
            const orderA = categoryOrderMap[a.category_id] ?? 999;
            const orderB = categoryOrderMap[b.category_id] ?? 999;

            if (orderA !== orderB) return orderA - orderB;

            return 0;
        });

        console.log({sortedFinalProducts})

        return sortedFinalProducts;
    }
};