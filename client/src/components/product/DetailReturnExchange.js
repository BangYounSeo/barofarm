import React from "react";
import "./detail.css";

const DetailReturnExchange = ({ producer }) => {
    return (
        <div className="return-container">
            <h3 className="return-title">반품/교환정보</h3>

            <div className="return-guide-box">
                반품 시 먼저 판매자와 연락하셔서 반품사유, 택배비, 배송비, 반품지 주소 등을 협의하신 후 반품 상품을 보내 주시기 바랍니다.
            </div>

            <table className="return-info-table">

                <tbody>

                    <tr>
                        <th>택배사</th>
                        <td>{producer?.courier || "판매자 지정 택배사 정보 없음"}</td>
                    </tr>
                    <tr>
                        <th>반품배송비</th>
                        <td> {producer?.returnShippingFee != null
                            ? `${producer.returnShippingFee.toLocaleString()}원`
                            : "판매자가 별도 안내"}</td>
                    </tr>
                    <tr>
                        <th>교환배송비</th>
                        <td>{producer?.exchangeShippingFee != null
                            ? `${producer.exchangeShippingFee.toLocaleString()}원`
                            : "판매자가 별도 안내"}</td>
                    </tr>
                    <tr>
                        <th>보내실 곳</th>
                        <td>
                            {producer?.addr1 || ""} {producer?.addr2 || ""} <br />
                            ({producer?.postalCode || "-"})
                        </td>
                    </tr>
                    <tr>
                        <th>반품/교환 가능 기간</th>
                        <td>상품 수령 후 7일 이내 (농산물 특성상 상품 상태 확인 필요)</td>
                    </tr>


                    <tr>
                        <th>반품/교환 불가 사유</th>
                        <td className="td-list">
                            ① 상품 훼손으로 재판매가 어려운 경우<br />
                            ② 고객 과실로 변질/파손된 경우<br />
                            ③ 시간 경과로 상품 가치 하락된 경우
                        </td>
                    </tr>
                </tbody>
            </table>
            {/* ⭐ 판매자 정보 박스 */}
            <div className="seller-info-box">
                <strong>판매자 정보</strong><br />
                상호명: {producer?.farmName || "정보 없음"}<br />
                대표자: {producer?.ceoName || "-"}<br />
                사업자번호: {producer?.bizNo || "-"}<br />
                주소: {producer?.addr1 || ""} {producer?.addr2 || ""} ({producer?.postalCode || ""})
            </div>

            {/* ⭐ 상품 구매 시 유의사항 */}
            <div className="notice-box">
                <strong>상품 구매 시 유의사항</strong>
                <ul>
                    <li>전자상거래법에 따른 반품 및 환불 기준은 판매자가 지정한 법률에 따릅니다.</li>
                    <li>단순 변심에 의한 반품은 상품 수령 후 7일 이내 가능합니다.</li>
                    <li>반품 사유가 소비자 귀책일 경우 왕복 배송비가 청구됩니다.</li>
                    <li>상품 수령 후 변질/파손 발생 시 즉시 고객센터로 연락 바랍니다.</li>
                </ul>
            </div>

            {/* ⭐ 신고 안내 */}
            <div className="notice-box">
                <strong>피해 신고 안내</strong><br />
                전자상거래 피해 신고센터 : 1372 소비자 상담센터<br />
                위조상품 의심 시 즉시 신고 바랍니다.
            </div>

        </div>

    );
};

export default DetailReturnExchange;
