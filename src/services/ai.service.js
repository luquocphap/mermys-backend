import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../common/prisma/connect.prisma.js";

export const aiService = {
    async recommendProducts(userPrompt) {
        const products = await prisma.products.findMany({
            where: { 
                isDeleted: 0,
            },
            select: {
                id: true,
                name: true,
                short_description: true,
                categories: { select: { name: true } }
            }
        });

        if (products.length === 0) return [];

        // 2. Định dạng dữ liệu thành chuỗi Text để nhồi vào Prompt
        const productDataString = products.map(p =>
            `ID: ${p.id} | Tên: ${p.name} | Danh mục: ${p.categories?.name || 'Khác'} | Mô tả: ${p.short_description || 'Không có'}`
        ).join('\n');

        // 3. Xây dựng Prompt "thần thánh"
        // Prompt này ép Gemini nhập vai chuyên gia và bắt buộc trả về đúng cấu trúc mảng JSON
        const prompt = `
            Bạn là một trợ lý ảo tư vấn tinh dầu và quà tặng của cửa hàng Memys.
            Dưới đây là danh sách các sản phẩm hiện có:
            ${productDataString}

            Yêu cầu của khách hàng: "${userPrompt}"

            Nhiệm vụ của bạn: Dựa vào yêu cầu trên, hãy phân tích và chọn ra đúng 10 sản phẩm phù hợp nhất.
            BẮT BUỘC CHỈ TRẢ VỀ ĐÚNG 1 MẢNG JSON CHỨA ID CỦA CÁC SẢN PHẨM. KHÔNG VIẾT THÊM BẤT KỲ CÂU CHỮ NÀO KHÁC.
            Ví dụ định dạng trả về hợp lệ: [1, 5, 12, 10, ...]
        `;

        // 4. Khởi tạo Gemini và gọi API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 5. Parse kết quả
        let recommendedIds = [];
        try {
            // Xử lý loại bỏ mã Markdown (```json ... ```) mà AI thỉnh thoảng tự chèn vào
            const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            recommendedIds = JSON.parse(cleanJsonStr);
        } catch (error) {
            console.error("Lỗi khi parse JSON từ Gemini:", responseText);
            return []; // Trả về mảng rỗng nếu AI trả lời sai format
        }

        // 6. Truy vấn lấy đầy đủ chi tiết của các sản phẩm vừa được AI chọn
        if (!Array.isArray(recommendedIds) || recommendedIds.length === 0) {
            return [];
        }

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

        return recommendedProducts;
    }
};