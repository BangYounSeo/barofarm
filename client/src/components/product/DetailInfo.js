// DetailInfo.js
import React, { useState, useEffect, useContext } from "react";
import "./detail.css";
import { useNavigate } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteIcon from "@mui/icons-material/Favorite"; // 🔥 찜된 상태 아이콘 추가
import api from "../../service/AxiosConfig"; // 🔥 Axios 설정 import
import { MemberContext } from "../member/login/MemberContext";

const DetailInfo = ({ board, producer, reviews }) => {

    const navigate = useNavigate();

    const phone = producer?.tel || producer?.phone || producer?.phoneNumber;

    //  로그인 여부
    const { loggedIn } = useContext(MemberContext);

    //  찜 상태 저장
    const [wish, setWish] = useState(false);

    //  상세 페이지 들어올 때 찜 여부 조회
    useEffect(() => {
        if (!loggedIn || !board) return; // 여기서 !board 처리
        api.get(`/wishlist/${board.numBrd}`)
            .then(res => setWish(res.data))
            .catch(() => setWish(false));
    }, [board, loggedIn]);

    // board가 아직 안 왔으면 여기서 return 처리
    if (!board) return null;

    //  찜 아이콘 클릭 → 토글 API 실행
    const toggleWish = async () => {
        if (!loggedIn) {
            if (window.confirm("회원만 사용 가능합니다.\n로그인 하시겠습니까?")) {
                navigate("/member/login", {
                    state: { redirectUrl: window.location.pathname }
                });
            }
            return;
        }

        try {
            const res = await api.post(`/wishlist/${board.numBrd}`);
            setWish(res.data);

            if (res.data === true) {
                alert("위시리스트에 저장되었습니다 ❤️");
            } else {
                alert("위시리스트에서 제거되었습니다 💔");
            }
        } catch (err) {
            console.error("찜 토글 실패:", err);
        }
    };

    //  price 없을 때 오류 방지
    const price = board.price || 0;

    //  리뷰 평균 계산
    const avg = reviews && reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.grade, 0) / reviews.length
        : 0;

    return (
        <div className="detail-info">
            {/* 🔥 상품 제목 영역 */}
            <h1 className="product-title">{board.subject}</h1>

            {/* 가격 + 찜 구역 */}
            <div className="price-wish-box">
                {board.stock === 0 ? (
                    <span className="sold-out-text">품절</span>
                ) : (
                    <span className="product-price">
                        {price.toLocaleString()}원
                    </span>
                )}
                {/* 찜 버튼 */}
                <button className="wish-btn-text" onClick={toggleWish}>
                    {wish ? (
                        <>
                            <FavoriteIcon className="icon-btn wish-active heart-pop" />
                            <span>찜</span>
                        </>
                    ) : (
                        <>
                            <FavoriteBorderIcon className="icon-btn" />
                            <span>찜</span>
                        </>
                    )}
                </button>
            </div>

            {/* 🔥 세부 정보 박스 */}

            <div className="info-section">
                <div className="info-row">
                    <span className="info-label">원산지:</span>
                    <span className="info-value">{board.origin}</span>
                </div>

                <div className="info-row">
                    <span className="info-label">판매자:</span>
                    <span className="info-value">{producer?.farmName || ""}</span>
                </div>

                <div className="info-row">
                    <span className="info-label">사업장 주소:</span>
                    <span className="info-value">{producer?.addr1 || ""}</span>
                </div>

                <div className="info-row">
                    <span className="info-label">상품후기:</span>
                    <span className="info-value">
                        ⭐ {avg.toFixed(1)} / 5.0 ({reviews.length}개)
                    </span>
                </div>
            </div>

        </div>
    );
};

export default DetailInfo;
