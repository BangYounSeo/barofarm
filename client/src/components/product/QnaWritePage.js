import React, { useState, useContext, useLayoutEffect } from "react";
import api from "../../service/AxiosConfig";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./detail.css";
import { MemberContext } from "../member/login/MemberContext";

const QnaWritePage = () => {

    //로그인 상태 확인 코딩
    const { loggedIn, userId } = useContext(MemberContext);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const productId = searchParams.get("product");

    const [content, setContent] = useState("");
    const [secret, setSecret] = useState(false);
    useLayoutEffect(() => {
        const token = localStorage.getItem("token");
    
        if(!token) {
            alert("로그인을 해주세요.")
            window.location.href = '/member/login'
            return;
        }
    
    })

    const submitQna = async () => {
        if (!content.trim()) {
            alert("문의 내용을 입력해주세요.");
            return;
        }



        if (!loggedIn) {
            alert("로그인 후 이용해주세요.");
            navigate("/member/login", { state: { redirectUrl: window.location.pathname } });
            return;
        }

        try {
            await api.post(
                `/salesboard/qna/write`,
                {
                    numBrd: productId,
                    content: content,
                    secret: secret    // 🔥 백엔드 필드명과 동일
                },
                {
                    params: { userId } // ⭐ 로그인된 ID 전달
                }
            );

            alert("문의가 등록되었습니다.");
            navigate(`/detail/${productId}?tab=qna`);
        } catch (err) {
            console.log(err);
            alert("등록 실패");
        }
    };

    return (
        <div className="qna-write-container">
            <h2 className="qna-write-title">상품 Q&A 작성하기</h2>

            <div className="qna-write-box">
                <textarea
                    className="qna-textarea"
                    placeholder="문의하실 내용을 입력해주세요."
                    maxLength={1000}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>

            <div className="qna-secret-box">
                <label className="secret-option">
                    <input
                        type="radio"
                        checked={!secret}
                        onChange={() => setSecret(false)}
                    />
                    공개
                </label>

                <label className="secret-option">
                    <input
                        type="radio"
                        checked={secret}
                        onChange={() => setSecret(true)}
                    />
                    비공개
                </label>
            </div>

            <div className="qna-info-box">
                ※ 문의하신 내용에 대한 답변은 마이페이지 또는 상품 Q&A에서 확인하실 수 있습니다.
            </div>

            <div className="qna-write-buttons">
                <button className="cancel-btn" onClick={() => navigate(-1)}>
                    취소
                </button>
                <button className="submit-btn" onClick={submitQna}>
                    등록
                </button>
            </div>
        </div>
    );
};

export default QnaWritePage;
