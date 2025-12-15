import api from "./AxiosConfig";

export const getQnaByProduct = async (numBrd, userId) => {
    const res = await api.get(`/salesboard/qna/${numBrd}`, {
        params: { viewerId: userId }
    });
    return res.data;
};

export const writeQnaAnswer = (numQna, answer) => {
    return api.post(`/salesboard/qna/${numQna}/answer`, { answer });
};

export const deleteQnaAnswer = (numQna) => {
    return api.delete(`/salesboard/qna/${numQna}/answer`);
};

export const deleteQna = (numQna) => {
    return api.delete(`/salesboard/qna/${numQna}`);
};
