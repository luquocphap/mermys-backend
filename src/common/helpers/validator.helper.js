export const validator = {
    /**
     * Kiểm tra email hợp lệ
     * @param {string} email
     * @returns {boolean}
     */
    isEmail(email) {
        if (!email) return false;
        email = String(email).trim();
        // Regex chuẩn RFC 5322 simplified
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Kiểm tra số điện thoại Việt Nam 10 số (bắt đầu 0)
     * @param {string} phone
     * @returns {boolean}
     */
    isVNPhone10(phone) {
        if (!phone) return false;
        phone = String(phone).trim();
        // Chỉ 10 số, bắt đầu 0
        return /^0\d{9}$/.test(phone);
    },

    /**
     * Kiểm tra địa chỉ hợp lệ (có thể tùy chỉnh)
     * - Tối thiểu 3 ký tự
     * - Không chứa ký tự lạ
     * @param {string} address
     * @returns {boolean}
     */
    isAddress(address) {
        if (!address) return false;
        address = String(address).trim();
        const regex = /^[\wÀ-ỹ0-9\s,.\-\/()]{5,}$/u;
        return regex.test(address);
    }
};