// DetailOptionSelector.js (네이버 옵션 + 버튼형 혼합)
import React, { useState } from "react";
import "./detail.css";

const DetailOptionSelector = ({ optionGroups, optionDetails, basePriceProp, onSelectOption }) => {

    /* ----------------------------------------------------
     * ⭐ 선택된 옵션 목록
     * ---------------------------------------------------- */
    const [selectedList, setSelectedList] = useState([]);

    /* ----------------------------------------------------
     * ⭐ 드롭다운 열림/닫힘
     * ---------------------------------------------------- */
    const [openDrop, setOpenDrop] = useState(false);

    /* ----------------------------------------------------
     * ⭐ 옵션 그룹 + 옵션 매핑
     * ---------------------------------------------------- */
    const groups = optionGroups.map(g => ({
        ...g,
        options: optionDetails.filter(d => d.numOptG === g.numOptG)
    }));

    /* ----------------------------------------------------
     * ⭐ 옵션 클릭 시 선택된 리스트에 추가
     * ---------------------------------------------------- */
    const handleSelect = (opt) => {

        // 품절 옵션(재고 0)은 선택 불가 처리
        if (opt.stock <= 0) return;

        if (selectedList.some(item => item.numOptD === opt.numOptD)) return;

        const newList = [
            ...selectedList,
            {
                ...opt,
                qty: 1,
                optionName: opt.optionName,   // 옵션명 (예: 중량)
                optionValue: opt.name, // 옵션값 (예: 3KG)
                price: opt.price ?? 0         // 추가금
            }
        ];

        setSelectedList(newList);
        onSelectOption(newList);  // 최신 List 전달
        setOpenDrop(false);
    };

    /* ----------------------------------------------------
     * ⭐ 수량 증가/감소
     * ---------------------------------------------------- */
    const changeQty = (id, amount) => {
        const updated = selectedList.map(item =>
            item.numOptD === id
                ? { ...item, qty: Math.max(1, item.qty + amount) }
                : item
        );
        setSelectedList(updated);
        onSelectOption(updated);   // ★ 부모 업데이트
    };


    /* ----------------------------------------------------
     * ⭐ 선택 옵션 삭제
     * ---------------------------------------------------- */
    const removeItem = (id) => {
        const updated = selectedList.filter(item => item.numOptD !== id);
        setSelectedList(updated);
        onSelectOption(updated);   // ★ 부모 업데이트
    };

    /* ----------------------------------------------------
     * ⭐ 총 상품 금액
     * ---------------------------------------------------- */
    const basePrice = Number(basePriceProp) || 0;
    const totalPrice = selectedList.reduce(
        (sum, item) => sum + (basePrice + item.price) * item.qty,
        0
    );

    return (
        <div className="option-box">

            {/* ----------------------------------------------------
                ⭐ 1) 상품 옵션 드롭다운 (네이버 스타일)
               ---------------------------------------------------- */}
            <div
                className="naver-opt-title"
                onClick={() => setOpenDrop(!openDrop)}
            >
                {groups[0]?.name || optionDetails[0]?.optionName || "옵션 선택"}
                <span>{openDrop ? "▲" : "▼"}</span>
            </div>

            {/* 드롭다운 내부 */}
            {openDrop && optionDetails?.length > 0 && (
                <div className="naver-opt-list">
                    {optionDetails
                        .sort((a, b) => a.price - b.price) // ⬅ 여기 추가!
                        .map(opt => (
                            <div
                                key={opt.numOptD}
                                className={`naver-opt-item ${opt.stock <= 0 ? "disabled" : ""}`}  //  품절 스타일 처리
                                onClick={() => opt.stock > 0 && handleSelect(opt)} //  품절 클릭 차단
                            >
                                <span>{opt.name}</span>
                                {/*  품절 라벨 */}
                                {opt.stock <= 0 ? (
                                    <span className="soldout-label">품절</span>
                                ) : (
                                    <span className="opt-price">
                                        + {opt.price.toLocaleString()}원
                                    </span>
                                )}
                            </div>
                        ))}
                </div>
            )}

            {/* ----------------------------------------------------
                ⭐ 3) 선택된 옵션 박스 (네이버 스타일)
               ---------------------------------------------------- */}
            {selectedList.length > 0 && (
                <div className="selected-option-wrapper">

                    {selectedList
                        .sort((a, b) => a.price - b.price)
                        .map(item => (
                            <div key={item.numOptD} className="selected-option-box">
                                <div className="selected-title">
                                    {item.optionValue}
                                </div>

                                <div className="selected-controls">
                                    <button onClick={() => changeQty(item.numOptD, -1)}>-</button>
                                    <span>{item.qty}</span>
                                    <button onClick={() => changeQty(item.numOptD, +1)}>+</button>

                                    <span className="selected-price">
                                        {(item.price * item.qty).toLocaleString()}원
                                    </span>

                                    <button
                                        className="remove-btn"
                                        onClick={() => removeItem(item.numOptD)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}

                    {/* 총 금액 */}
                    <div className="total-price-display">
                        총 상품금액: {totalPrice.toLocaleString()}원
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailOptionSelector;
