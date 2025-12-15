// src/components/product/CartPage.js
import React, { useEffect, useState, useContext, navigate, useLayoutEffect } from "react";
import { MemberContext } from "../member/login/MemberContext";
import { createOrder } from "../../service/PaymentService";
import * as PortOne from "@portone/browser-sdk/v2";
import { useLocation, useNavigate } from "react-router-dom";
import {
    getCartList,
    updateCartQuantity,
    deleteSelectedCart,
    deleteAllCart,
} from "../../service/CartService";
import "./cart.css";


const CartPage = () => {

    //로그인 상태 확인 코딩
    const { loggedIn, userId } = useContext(MemberContext);
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [checkedItems, setCheckedItems] = useState([]); // ⭐ 선택 체크박스 상태
    const location = useLocation();
    // ===============================
    // 장바구니 데이터 로드
    // ===============================
    useEffect(() => {
        localStorage.removeItem("orderDatas");
        loadData();
    }, []);

    useLayoutEffect(() => {
        const token = localStorage.getItem("token");
    
        if(!token) {
          alert("로그인을 해주세요.")
          window.location.href = '/member/login'
          return;
        }
    
    })

    const loadData = async () => {
        const userId = localStorage.getItem("userId");
        const result = await getCartList(userId);
        result.data.map(item =>{
            item.price = item.board.price
        })
        setCartItems(result.data);
        // ⭐ 처음 로딩 시 전체 선택
        setCheckedItems(result.data.map((item) => item.cartId));
    };
    console.log("cartItems", cartItems)
    // ===============================
    // 개별 선택 toggle
    // ===============================
    const toggleCheck = (cartId) => {
        setCheckedItems((prev) =>
            prev.includes(cartId)
                ? prev.filter((id) => id !== cartId)
                : [...prev, cartId]
        );
    };

    // ===============================
    // 전체 선택 toggle
    // ===============================
    const toggleAll = () => {
        if (checkedItems.length === cartItems.length) {
            setCheckedItems([]);
        } else {
            setCheckedItems(cartItems.map((item) => item.cartId));
        }
    };

    // ===============================
    // 선택 상품 총 가격 계산
    // ===============================
    const totalPrice = cartItems
        .filter((item) => checkedItems.includes(item.cartId))
        .reduce(
            (sum, item) => sum + (item.unitPriceSnapshot+item.price) * item.quantity,
            0
        );
    // ===============================
    // ⭐ 수량 증가/감소 기능
    // ===============================
    const updateQuantityHandler = async (cartId, quantity) => {
        if (quantity < 1) return; // 0 이하 금지
        await updateCartQuantity({ cartId, quantity });
        loadData();
    };

    // ===============================
    // ⭐ 선택 삭제
    // ===============================
    const deleteCheckedItems = async () => {
        await deleteSelectedCart(checkedItems);
        loadData();
    };

    // ===============================
    // ⭐ 전체 삭제
    // ===============================
    const deleteAllItems = async () => {

        await deleteAllCart(userId);
        loadData();
    };

    return (
        <div className="detail-wrapper">
            <h2 className="cart-title-main">장바구니</h2>

            <div className="cart-layout">
                {/* ======================= */}
                {/* 좌측 장바구니 리스트 */}
                {/* ======================= */}
                <div className="cart-left-area">
                    <div className="cart-select-all-row">
                        <input
                            id="selectAll"
                            type="checkbox"
                            className="cart-check"
                            checked={checkedItems.length === cartItems.length}
                            onChange={toggleAll}
                        />
                        <label htmlFor="selectAll" className="select-all-label">
                            전체 선택
                        </label>

                        {/* ⭐ 선택 삭제 버튼 추가 */}
                        <button
                            className="cart-delete-selected-btn"
                            onClick={deleteCheckedItems}
                        >
                            선택 삭제
                        </button>
                    </div>

                    {cartItems.map((item) => (
                        <div className="cart-item-box" key={item.cartId}>
                            {/* 개별 체크 */}
                            <input
                                type="checkbox"
                                checked={checkedItems.includes(item.cartId)}
                                onChange={() => toggleCheck(item.cartId)}
                                className="cart-check"
                            />

                            {/* 상품 이미지 */}
                            <img
                                src={item.board.thumbnail || "/no-image.png"}
                                alt="thumbnail"
                                className="cart-thumb-img"
                            />

                            {/* 상품 정보 */}
                            <div className="cart-info-area">
                                <div className="cart-title">{item.board.subject}</div>
                                <div className="cart-option">
                                </div>

                                {/* ⭐ 옵션명 + 수량 + 총금액 표시 (네이버 스타일) */}
                                <div className="cart-option">
                                    <span style={{ fontWeight: "600", marginRight: "6px", color: "#666" }}>옵션</span>
                                    <span className="cart-option-name">{item.optionDetail.optionName} / {item.optionDetail.name}</span>

                                    <span style={{ fontWeight: "600", marginRight: "6px", color: "#666" }}>수량</span>
                                    <span className="cart-option-qty">{item.quantity}개 </span>
                                    <span className="cart-option-price">
                                        ({((item.price+item.unitPriceSnapshot) * item.quantity).toLocaleString()}원)
                                    </span>
                                </div>

                                {/* ⭐ 수량 변경 */}
                                <div className="cart-row">
                                    <div className="cart-qty-box">
                                        <button
                                            className="qty-btn"
                                            onClick={() =>
                                                updateQuantityHandler(item.cartId, item.quantity - 1)
                                            }
                                        >
                                            -
                                        </button>

                                        <span className="qty-count">{item.quantity}</span>

                                        <button
                                            className="qty-btn"
                                            onClick={() =>
                                                updateQuantityHandler(item.cartId, item.quantity + 1)
                                            }
                                        >
                                            +
                                        </button>
                                    </div>

                                    <span className="cart-price">
                                        {((item.price+item.unitPriceSnapshot) * item.quantity).toLocaleString()}원
                                    </span>
                                </div>

                                <button className="cart-buy-btn" onClick={() => {
                            if (!loggedIn) {
                                navigate("/member/login", { state: { redirectUrl: window.location.pathname } });
                                return;
                            }
                            if (checkedItems.length === 0) return alert("상품을 선택하세요!");

                            // 📌 선택된 카트 아이템만 필터링
                            const selectedProducts =[ {
                                cartId: item.cartId,
                                numBrd: Number(item.board.numBrd),
                                numOptD: Number(item.optionDetail.numOptD),
                                numOptG: Number(item.optionDetail.numOptG),
                                name:item.optionDetail.name,
                                optionName: item.optionDetail.optionName,
                                price: item.unitPriceSnapshot + item.board.price,   // 최종 가격
                                quantity: item.quantity,

                                enabled: "1", 
                                productName: item.board.subject,
                                productImage: item.board.thumbnail
                            }];
                            const total = selectedProducts[0].price
                            console.log("total",total)
                            // 📌 구매 페이지로 이동 + 데이터 전달
                            navigate("/paymentDetail", {
                                state: {
                                    userId,
                                    items: selectedProducts,
                                    totalPrice:total
                                }
                            });
                        }}>바로구매</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ======================= */}
                {/* 우측 주문 요약 영역      */}
                {/* ======================= */}
                <div className="cart-total-box">
                    <h3>전체 주문시 금액</h3>

                    <div className="cart-total-row">
                        <span>총 상품금액</span>
                        <span>{totalPrice.toLocaleString()}원</span>
                    </div>

                    <div className="cart-total-row">
                        <span>배송비</span>
                        <span>0원</span>
                    </div>

                    <div className="cart-total-final">
                        총 결제금액 <b>{totalPrice.toLocaleString()}원</b>
                    </div>

                    {/* ⭐ 수정: onSucceed 제거 & Promise 방식 적용 */}
                    <button
                        className="cart-order-btn"
                        onClick={() => {
                            if (!loggedIn) {
                                navigate("/member/login", { state: { redirectUrl: window.location.pathname } });
                                return;
                            }
                            if (checkedItems.length === 0) return alert("상품을 선택하세요!");

                            // 📌 선택된 카트 아이템만 필터링
                            const selectedProducts = cartItems
                            .filter(item => checkedItems.includes(item.cartId))
                            .map(item => ({
                                cartId: item.cartId,
                                numBrd: Number(item.board.numBrd),
                                numOptD: Number(item.optionDetail.numOptD),
                                numOptG: Number(item.optionDetail.numOptG),
                                name:item.optionDetail.name,
                                optionName: item.optionDetail.optionName,
                                price: item.unitPriceSnapshot + item.board.price,   // 최종 가격
                                quantity: item.quantity,

                                enabled: "1", 
                                productName: item.board.subject,
                                productImage: item.board.thumbnail
                            }));

                            // 📌 구매 페이지로 이동 + 데이터 전달
                            navigate("/paymentDetail", {
                                state: {
                                    userId,
                                    items: selectedProducts,
                                    totalPrice,
                                }
                            });
                        }}
                    >
                        전체 주문하기
                    </button>

                    {/* ⭐ 전체 삭제 버튼 */}
                    <button
                        className="cart-order-btn cart-delete-all-btn"
                        style={{ marginTop: "10px" }}
                        onClick={deleteAllItems}
                    >
                        전체 삭제
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
