import moment from "moment";

export const convertToIST = (date: string | Date) => {
    return moment.utc(date, "YYYY-MM-DD HH:mm:ss").utcOffset(330);
};
