export function formatPrice(value: number | string): string {
    if (!value && value !== 0) return "0.00";

    const num = Number(value);

    if (isNaN(num)) return "0.00";

    return num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};