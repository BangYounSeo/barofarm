// DetailReview.js
import React, { useState, useEffect, useContext } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import "./detail.css";
import { MemberContext } from "../member/login/MemberContext";
import { useNavigate } from "react-router-dom";
import { getReviewGood, toggleReviewGood, reportReview } from "../../service/ReviewService";
import { deleteReviewApi } from "../../service/ReviewService";

import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { IconButton } from "@mui/material";


const BASE_URL = "http://localhost:8080";

// ⭐ 공통 이미지 URL 생성
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

// ⭐ 사용자 정보 가져오기 수정!
const DetailReview = ({ reviews, startIndex = 0, refreshReviews }) => {
    const { loggedIn, userId } = useContext(MemberContext);  // ⭐ userId 추가
    const navigate = useNavigate();

    // ⭐ 좋아요 상태
    const [likeState, setLikeState] = useState({});

    // ⭐ 신고 모달 상태
    const [openReportModal, setOpenReportModal] = useState(false);
    const [selectedReviewId, setSelectedReviewId] = useState(null);
    const [reasonCode, setReasonCode] = useState("AD");
    const [detail, setDetail] = useState("");

    // ⭐ 리뷰 이미지 모달 상태
    const [open, setOpen] = useState(false);
    const [modalImages, setModalImages] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // ⭐ 리뷰 없는 경우도 Hook보다 아래 있어야 함
    const avg = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.grade, 0) / reviews.length
        : 0;

    const review = reviews[startIndex];
    const images = review.reviewImages || review.images || [];

    const isLiked = likeState.liked ?? review.liked ?? false;
    const likeCount = likeState.likeCount ?? review.likeCount ?? 0;

    const handleDelete = async (numRev) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
            await deleteReviewApi(numRev);
            alert("삭제 완료되었습니다.");
            if (refreshReviews) refreshReviews();   // 리뷰 목록 새로고침
        } catch (err) {
            alert("삭제 실패");
        }
    };

    // ⭐ 좋아요 정보 로드
    useEffect(() => {
        if (!review) return;
        getReviewGood(review.numRev).then(res => setLikeState(res.data));
    }, [review]);

    if (!reviews || reviews.length === 0)
        return <div className="review-empty">아직 리뷰가 없습니다.</div>;

    return (
        <div className="review-wrapper">

            {/* ---- 헤더 ---- */}
            <div className="review-header-box">
                <h3 className="review-title">상품 리뷰 ({reviews.length})</h3>
                <div className="review-avg-box">
                    <span className="avg-score">{avg.toFixed(1)}</span>
                    <span className="avg-max">/ 5.0</span>
                </div>
            </div>

            <div className="review-list">
                <div className="review-card">

                    {/* ---- 리뷰 카드 헤더 ---- */}
                    <div className="review-card-header">
                        <div className="review-user-info">
                            <span className="review-writer">
                                {review.member?.name || "익명"}
                            </span>
                            <span className="review-date">
                                {review.created?.substring(0, 10)}
                            </span>
                        </div>

                        <div className="review-actions">

                            {/* 👍 좋아요 버튼 */}


                            <IconButton
                                onClick={() => {
                                    if (!loggedIn) {
                                        alert("로그인이 필요합니다!");
                                        navigate("/member/login");
                                        return;
                                    }
                                    toggleReviewGood(review.numRev).then(() => {
                                        // 🔥 로컬 상태 즉시 반영
                                        setLikeState(prev => {
                                            const currentLiked = prev.liked ?? review.liked ?? false;
                                            const currentCount = prev.likeCount ?? review.likeCount ?? 0;

                                            return {
                                                liked: !currentLiked,
                                                likeCount: currentLiked ? currentCount - 1 : currentCount + 1
                                            };
                                        });

                                        if (refreshReviews) refreshReviews(); // 아래 리스트 최신화
                                    });
                                }}
                                sx={{
                                    color: isLiked ? "#FF7A3C" : "#B5B5B5",
                                    "&:hover": {
                                        transform: "scale(1.15)",
                                        color: "#FF7A3C"
                                    },
                                    transition: "0.2s"
                                }}
                            >
                                {isLiked ? (
                                    <ThumbUpAltIcon fontSize="medium" />
                                ) : (
                                    <ThumbUpOffAltIcon fontSize="medium" />
                                )}
                                <span style={{ marginLeft: "6px", fontSize: "14px", color: "#333" }}>
                                    {likeCount}
                                </span>
                            </IconButton>


                            {/* 🚨 신고 버튼 */}
                            <IconButton
                                onClick={() => {
                                    if (!loggedIn) {
                                        alert("로그인이 필요합니다!");
                                        navigate("/member/login");
                                        return;
                                    }
                                    reportReview(review.numRev, { reasonCode: "ETC" })
                                        .then(() => {
                                            alert("신고가 접수되었습니다!");
                                            if (refreshReviews) refreshReviews();
                                        })
                                        .catch(() => alert("이미 신고한 리뷰입니다."));
                                }}
                                sx={{
                                    color: "#FF7A3C",
                                    "&:hover": { transform: "scale(1.1)", color: "#FF9069" }
                                }}
                            >
                                <ReportProblemIcon fontSize="small" />
                            </IconButton>

                        </div>
                    </div>

                    {loggedIn && review.member?.userId === userId && (
                        <>
                            <button
                                className="review-edit-btn"
                                onClick={() => navigate(`/review/write/${review.numBrd}?edit=${review.numRev}`)}
                            >
                                수정
                            </button>

                            <button
                                className="review-delete-btn"
                                onClick={() => handleDelete(review.numRev)}
                            >
                                삭제
                            </button>
                        </>
                    )}

                    {/* ---- 리뷰 본문 ---- */}
                    <div className="review-body-row">

                        <div className="review-text">
                            {review.content}
                        </div>

                        {images.length > 0 && (
                            <div className="review-image-list right-image">

                                {/* 대표 이미지 + +N 표시 */}
                                {images.slice(0, 1).map((img, index) => (
                                    <div
                                        key={img.numRevImg}
                                        className="review-image-wrapper"
                                        onClick={() => {
                                            setModalImages(images.map(i => getImgSrc(i)));
                                            setSelectedIndex(index);
                                            setOpen(true);
                                        }}
                                    >
                                        <img
                                            className="review-image-thumb"
                                            src={getImgSrc(img)}
                                            alt="리뷰"
                                        />
                                        {images.length > 1 && (
                                            <div className="review-more-count">
                                                +{images.length - 1}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* ---- 이미지 모달 ---- */}
            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    outline: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                }}>
                    <button
                        className="modal-arrow-btn"
                        onClick={() =>
                            setSelectedIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length)
                        }
                    >
                        〈
                    </button>

                    <img
                        src={modalImages[selectedIndex]}
                        alt="확대"
                        className="review-modal-img"
                    />

                    <button
                        className="modal-arrow-btn"
                        onClick={() =>
                            setSelectedIndex((prev) => (prev + 1) % modalImages.length)
                        }
                    >
                        〉
                    </button>
                </Box>
            </Modal>

            {/* ---- 신고 모달 ---- */}
            <Modal open={openReportModal} onClose={() => setOpenReportModal(false)}>
                <Box className="report-modal-box">

                    <h3>신고하기</h3>

                    <label><input type="radio" value="AD" checked={reasonCode === "AD"} onChange={(e) => setReasonCode(e.target.value)} /> 광고/홍보글</label>
                    <label><input type="radio" value="ABUSE" checked={reasonCode === "ABUSE"} onChange={(e) => setReasonCode(e.target.value)} /> 욕설/비방</label>
                    <label><input type="radio" value="PORN" checked={reasonCode === "PORN"} onChange={(e) => setReasonCode(e.target.value)} /> 음란/선정성</label>
                    <label><input type="radio" value="ETC" checked={reasonCode === "ETC"} onChange={(e) => setReasonCode(e.target.value)} /> 기타</label>

                    <textarea
                        className="report-detail-box"
                        placeholder="상세 내용을 입력해주세요 (선택)"
                        value={detail}
                        onChange={(e) => setDetail(e.target.value)}
                    />

                    <div className="report-modal-actions">
                        <button
                            onClick={() => {
                                reportReview(selectedReviewId, { reasonCode, detail })
                                    .then(() => {
                                        alert("신고가 접수되었습니다!");
                                        setOpenReportModal(false);
                                        setDetail("");
                                    })
                                    .catch(err => {
                                        alert(err.response?.data || "이미 신고한 리뷰입니다.");
                                    });
                            }}
                        >
                            신고
                        </button>

                        <button onClick={() => setOpenReportModal(false)}>취소</button>
                    </div>
                </Box>
            </Modal>

        </div>
    );
};

export default DetailReview;
