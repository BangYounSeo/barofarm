// src/components/product/WishlistPage.js
import React, { useEffect, useState } from "react";
import { getMyWishlist } from "../../service/WishlistService";
import { useNavigate } from "react-router-dom";
import "./detail.css"; // 임시 스타일 재활용 (별도 CSS 분리 가능)

const WishlistPage = () => {
    const [list, setList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {

        console.log("🔥 Wishlist API 호출 시작!!");

        getMyWishlist()
            .then(res => {
                console.log("✅ Wishlist 응답 전체:", res);
                console.log("✅ 찜 목록 데이터:", res.data);
                setList(res.data);
            })
            .catch(err => console.error("찜목록 조회 실패:", err));
    }, []);

    return (
        <div className="detail-wrapper">
            <h2 style={{ marginBottom: "20px" }}>찜한 상품</h2>

            {list.length === 0 ? (
                <p>찜한 상품이 없습니다.</p>
            ) : (
                <div className="wish-grid">
                    {list.map(item => (
                        <div
                            key={item.numBrd}                            // ✅ DTO의 numBrd 사용
                            className="wish-item"
                            onClick={() => navigate(`/detail/${item.numBrd}`)} // ✅ 상세 페이지 이동
                        >
                            <img
                                className="wish-thumb"
                                src={item.thumbnail || "/no_img.png"}      // ✅ DTO의 thumbnail 사용
                                alt={item.subject}
                            />
                            <p className="wish-name">{item.subject}</p>
                            <p className="wish-price">
                                {item.price.toLocaleString()}원
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
