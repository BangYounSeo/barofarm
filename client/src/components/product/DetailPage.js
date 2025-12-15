// DetailPage.js
import React, { useContext, useEffect, useState } from "react";
import { getProductDetail } from "../../service/ProductService";
import { getPagedReviews } from "../../service/ReviewService";
import { addCartItem } from "../../service/CartService";
import DetailImages from "./DetailImages";
import DetailInfo from "./DetailInfo";
import DetailOptionSelector from "./DetailOptionSelector";
import DetailQnA from "./DetailQnA";
import DetailReturnExchange from "./DetailReturnExchange";
import DetailReviewList from "./DetailReviewList";
import DetailReview from "./DetailReview";
import ReviewSummary from "./ReviewSummary";
import PhotoReviewGallery from "./PhotoReviewGallery";
import { useNavigate, useParams } from "react-router-dom";
import { createOrder } from "../../service/PaymentService";
import * as PortOne from "@portone/browser-sdk/v2";
import { getQnaByProduct } from "../../service/QnaService";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import "./detail.css";
import { MemberContext } from "../member/login/MemberContext";


// ⭐ 이미지 경로 통일 함수 추가 (PhotoReviewGallery 동일)
const BASE_URL = "http://localhost:8080";
const getImgSrc = (img) => {
    if (!img) return "";

    if (img.url) return img.url;
    if (img.path && img.path.startsWith("http")) return img.path;

    if (img.path && img.saveFileName) {
        let fixed = img.path.replace(/\\/g, "/");
        if (!fixed.startsWith("/")) fixed = "/" + fixed;
        if (!fixed.endsWith("/")) fixed = fixed + "/";
        return BASE_URL + fixed + img.saveFileName;
    }
    return "";
};

const DetailPage = () => {

   localStorage.removeItem("orderDatas");
    
    const { numBrd } = useParams();
    const { loggedIn, userId, role, setCartCount } = useContext(MemberContext);

    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState("desc");
    const navigate = useNavigate();
    const [qnas, setQnas] = useState([]);

    useEffect(() => {
        if (!numBrd) return;
        getQnaByProduct(numBrd, userId).then(data => setQnas(data));
    }, [numBrd]);

    // ⭐ 리뷰 관련 상태
    const [reviews, setReviews] = useState([]);
    const [reviewPage, setReviewPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const REVIEWS_PER_PAGE = 5;

    // ⭐ 모달들
    const [openPhotoModal, setOpenPhotoModal] = useState(false);
    const [openReviewDetail, setOpenReviewDetail] = useState(false);
    const [selectedReviewIndex, setSelectedReviewIndex] = useState(0);

    const [selectedOptionId, setSelectedOptionId] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPaymentComplete, setShowPaymentComplete] = useState(false);

    /** ⭐ 리뷰 페이징 데이터 로드 */
    const loadPagedReviews = async () => {
        if (!numBrd) return;
        try {
            console.log("🔍 리뷰 API 호출:", { numBrd, reviewPage, size: REVIEWS_PER_PAGE });
            const res = await getPagedReviews(numBrd, reviewPage, REVIEWS_PER_PAGE);
            console.log("✅ 리뷰 API 응답:", res.data);
            setReviews(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error("❌ 리뷰 불러오기 실패:", err);
        }
    };

    /** ⭐ 좋아요/신고 후 리뷰 전체 새로고침 */
    const refreshReviews = async () => {
        await loadPagedReviews(); // 🔥 좋아요 변경 즉시 최신 리뷰 다시 불러옴
    };

    /** ⭐ 상품 상세 데이터 로드 */
    const loadData = async () => {
        const res = await getProductDetail(numBrd);
        setData(res);
    };

    // ⭐⭐⭐ [수정] 초기 로딩: numBrd 변경 시 상품 정보 + 리뷰 둘 다 로드
    useEffect(() => {
        const init = async () => {
            await loadData();
            loadPagedReviews();  // ⭐ 여기서 초기 리뷰 로드
        };
        init();

        // cleanup: 페이지 이동 시 reviewPage 초기화
        return () => {
            setReviewPage(0);
        };
    }, [numBrd]);

    // ⭐⭐⭐ [수정] 페이지 변경 시에만 리뷰 재로드
    useEffect(() => {
        if (reviewPage > 0) {  // ⭐ 초기 로드(page=0)는 위에서 했으므로 중복 방지
            loadPagedReviews();
        }
    }, [reviewPage]);

    // ⭐ 옵션 선택 debug
    useEffect(() => {
        console.log("현재 선택된 옵션:", selectedOptionId);
    }, [selectedOptionId]);



    if (!data) return <div>로딩중...</div>;



    const baseBoard = data.board || data.salesBoard;

    const producer = data?.producer || data?.board?.producer || null;

    const isSoldOut = baseBoard.stock <= 0; // ⭐ 품절 여부 판단


    /** ⭐ 포토 리뷰 리스트 생성 (요약/포토용은 기존 data.reviews 그대로 사용) */
    const photoList = [];
    data.reviews.forEach((r, idx) => {
        r.images?.forEach(img => {
            photoList.push({
                ...img,
                reviewIndex: idx
            });
        });
    });

    /** ⭐ 대표 이미지 */
    const mainImage =
        data.images?.find(img => img.isThumbnail === "Y") ??
        data.images?.find(img => img.sortOrder === 1) ??
        null;

    const selectedTotalPrice = selectedOptionId.length > 0 ? (selectedOptionId.reduce((sum, item) => {
        return sum + ((item.price + data.board.price) * item.qty);
    }, 0)) : 0;


    console.log("s", selectedOptionId)

    const purchaseItemList = selectedOptionId.length > 0
        ? selectedOptionId.map(item => {
            const { qty, price, ...rest } = item; // qty를 빼고 나머지 저장
            return {
                ...rest,                    // 나머지 필드는 그대로
                quantity: qty,              // qty를 quantity로 이름 변경
                numBrd: numBrd,
                productImage: mainImage.path,
                productName: data.board.subject,
                price: data.board.price + item.price
            };
        })
        : null;
    console.log(purchaseItemList)
    return (
        <div className="detail-wrapper">

            {/* ================== 상단 영역 ================== */}
            <div className="detail-top-section">
                <div className="detail-left">
                    <DetailImages images={data.images} />
                </div>

                <div className="detail-right">

                    <DetailInfo
                        board={baseBoard}
                        producer={data.producer}
                        reviews={data.reviews}
                    />

                    <DetailOptionSelector
                        optionGroups={data.optionGroups || []}
                        optionDetails={data.optionDetails || []}
                        basePriceProp={baseBoard.price || 0}
                        onSelectOption={setSelectedOptionId}
                    />

                    {/* ⭐ 품절 안내 메시지 추가 */}
                    {isSoldOut && (
                        <p style={{ color: "#d32f2f", fontWeight: 600, marginTop: "10px" }}>
                            현재 이 상품은 품절되었습니다.
                        </p>
                    )}

                    <div className="purchase-actions">
                        {/* ⭐ 품절 시 버튼 disabled 처리 */}
                        <button
                            className="cart-btn"
                            disabled={isSoldOut}
                            style={isSoldOut ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                            onClick={async () => {
                                if (!loggedIn) {
                                    alert("로그인이 필요합니다!");
                                    navigate("/member/login", {
                                        state: { redirectUrl: window.location.pathname }
                                    });
                                    return;
                                }
                                if (!selectedOptionId.length) return alert("옵션을 선택해주세요!");
                                if (isSoldOut) return alert("품절된 상품입니다.");

                                setIsSubmitting(true);
                                try {
                                    await Promise.all(
                                        selectedOptionId.map(opt =>
                                            addCartItem({
                                                userId,
                                                numBrd: baseBoard.numBrd,
                                                numOptD: opt.numOptD,
                                                quantity: opt.qty,
                                                optionName: opt.optionName,
                                                productImage: mainImage?.path + mainImage?.saveFileName
                                            })
                                        )
                                    );
                                    navigate("/cart", {
                                        state: { defaultPrice: data.board.price }
                                    });
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                        >
                            장바구니
                        </button>

                        <button
                            className="buy-btn"
                            disabled={isSoldOut}
                            style={isSoldOut ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                            onClick={() => {
                                if (isSoldOut) return alert("품절된 상품입니다.");

                                if (!loggedIn) {
                                    alert("로그인이 필요합니다!");
                                    navigate("/member/login", {
                                        state: { redirectUrl: window.location.pathname }
                                    });
                                    return;
                                }

                                if (!selectedOptionId.length)
                                    return alert("옵션을 선택해주세요!");

                                const purchaseAdd = window.confirm("상품을 구매하시겠습니까?");
                                if (!purchaseAdd) return;

                                try {

                                    navigate("/paymentDetail", {
                                        state: {
                                            userId,
                                            items: purchaseItemList,
                                            totalPrice: selectedTotalPrice
                                        }
                                    });

                                } catch (error) {

                                }
                            }}
                        >
                            구매하기
                        </button>
                    </div>
                </div>
            </div>

            {/* ================== 탭 메뉴 ================== */}
            <div className="detail-tab-menu">
                <button className={activeTab === "desc" ? "active" : ""} onClick={() => setActiveTab("desc")}>
                    상세설명
                </button>
                <button className={activeTab === "review" ? "active" : ""} onClick={() => setActiveTab("review")}>
                    상품후기
                </button>
                <button className={activeTab === "qna" ? "active" : ""} onClick={() => setActiveTab("qna")}>
                    상품문의
                </button>
                <button className={activeTab === "return" ? "active" : ""}
                    onClick={() => setActiveTab("return")}>
                    반품/교환정보
                </button>
            </div>

            {/* ================== 콘텐츠 영역 ================== */}
            <div className="detail-content-section">

                {/* 상세설명 */}
                {activeTab === "desc" && (
                    <div
                        className="detail-description"
                        dangerouslySetInnerHTML={{ __html: data.board.content }}
                    ></div>
                )}

                {/* 리뷰 */}
                {activeTab === "review" && (
                    <div className="review-section">
                        <ReviewSummary reviews={data.reviews} />

                        <PhotoReviewGallery
                            reviews={data.reviews}
                            onOpenDetail={() => setOpenPhotoModal(true)}
                            onSelectReview={(idx) => {
                                setSelectedReviewIndex(idx);
                                setOpenReviewDetail(true);
                            }}
                            refreshReviews={refreshReviews}
                        />

                        {/* 리뷰 작성 버튼 */}
                        <div className="review-write-box">
                            <button
                                className="review-write-btn"
                                onClick={() => {
                                    if (!loggedIn) {
                                        alert("로그인이 필요합니다.");
                                        navigate("/member/login");
                                        return;
                                    }
                                    navigate(`/review/write/${numBrd}`);
                                }}
                            >
                                리뷰 작성하기
                            </button>
                        </div>

                        <DetailReviewList
                            reviews={reviews.length > 0 ? reviews : data?.reviews || []}
                            reviewPage={reviewPage}
                            totalReviews={data?.reviews?.length || 0}
                            totalPages={totalPages}
                            setReviewPage={setReviewPage}
                            refreshReviews={refreshReviews}
                        />
                    </div>
                )}

                {/* ⭐ 상품문의 (QnA) 탭에서만 렌더링 ⭐ */}
                {activeTab === "qna" && (
                    <div className="qna-section">
                        <div className="qna-write-box">
                            <button
                                className="review-write-btn"
                                onClick={() => navigate(`/qna/write?product=${numBrd}`)}
                            >
                                상품 Q&A 작성하기
                            </button>
                        </div>

                        <DetailQnA
                            qnas={qnas}
                            producer={data.producer}
                            role={role}
                            userId={userId}
                        />
                    </div>
                )}
            </div>

            {/* 반품 교환 탭에서만 렌더링 */}

            {activeTab === "return" && (
                <DetailReturnExchange producer={data.producer} />
            )}


            {/* ================== 포토 리뷰 모달 ================== */}
            <Modal open={openPhotoModal} onClose={() => setOpenPhotoModal(false)}>
                <Box sx={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "white", width: "900px",
                    maxHeight: "90vh", overflowY: "auto",
                    p: 3, borderRadius: "12px"
                }}>
                    <h2>전체 포토 & 동영상 리뷰 ({data.reviews.length})</h2>
                    <div className="photo-modal-all">
                        {photoList.map(img => (
                            <img
                                key={img.numRevImg}
                                src={getImgSrc(img)}
                                className="photo-modal-thumb"
                                onClick={() => {
                                    setSelectedReviewIndex(img.reviewIndex);
                                    setOpenReviewDetail(true);
                                    setOpenPhotoModal(false);
                                }}
                            />
                        ))}
                    </div>
                </Box>
            </Modal>

            {/* ================== 리뷰 상세 모달 ================== */}
            <Modal open={openReviewDetail} onClose={() => setOpenReviewDetail(false)}>
                <Box sx={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "900px", height: "650px",
                    bgcolor: "white", borderRadius: "12px",
                    p: 3, overflowY: "auto"
                }}>
                    <DetailReview
                        reviews={reviews.length > 0 ? reviews : data.reviews}
                        startIndex={selectedReviewIndex}
                        refreshReviews={refreshReviews}
                    />
                </Box>
            </Modal>

        </div>
    );
};

export default DetailPage;