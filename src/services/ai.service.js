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
            Ngoài ra, sản phẩm bạn trả về phải được sort theo category. Thứ tự các sản phẩm được xếp theo thứ tự category_id là 6, 1, 2, 4, 5
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
            console.error("Lỗi AI (Rate Limit / JSON Parse), kích hoạt danh sách Mặc định:", error.message);
            
            // LOGIC FALLBACK: Chọn 10 sản phẩm mặc định
            // Sắp xếp tay theo đúng thứ tự category_id 6, 1, 2, 4, 5 như prompt yêu cầu
            const defaultOrder = { 6: 1, 1: 2, 2: 3, 4: 4, 5: 5 };
            
            const defaultProducts = products
                .sort((a, b) => {
                    const orderA = defaultOrder[a.category_id] || 99;
                    const orderB = defaultOrder[b.category_id] || 99;
                    return orderA - orderB;
                })
                .slice(0, 10); // Lấy 10 sản phẩm đầu tiên sau khi sort
            
            recommendedIds = defaultProducts.map(p => p.id);
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
        const sortedFinalProducts = recommendedIds
            .map(id => recommendedProducts.find(p => p.id === id))
            .filter(Boolean); // Bỏ qua nếu lỡ ID không tìm thấy

        return sortedFinalProducts;
    }
};