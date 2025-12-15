// DetailReviewList.js
import React, { useEffect, useState, useContext } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { getReviewGood, toggleReviewGood, reportReview } from "../../service/ReviewService";
import { useNavigate } from "react-router-dom";
import "./detail.css";
import { MemberContext } from "../member/login/MemberContext";
import { deleteReviewApi } from "../../service/ReviewService";

// ⭐ 아이콘 변경된 부분
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { IconButton } from "@mui/material";

const DetailReviewList = ({ reviews, reviewPage, totalPages, totalReviews, setReviewPage, refreshReviews }) => {

    const BASE_URL = "http://localhost:8080";
    const navigate = useNavigate();
    const { loggedIn, userId } = useContext(MemberContext); // 로그인확인

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

    const [open, setOpen] = useState(false);
    const [modalImages, setModalImages] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [likeState, setLikeState] = useState({});
    const [openReportModal, setOpenReportModal] = useState(false);
    const [selectedReviewId, setSelectedReviewId] = useState(null);
    const [reasonCode, setReasonCode] = useState("AD");
    const [detail, setDetail] = useState("");

    useEffect(() => {
        reviews.forEach(r => {
            getReviewGood(r.numRev).then(res => {
                setLikeState(prev => ({
                    ...prev,
                    [r.numRev]: res.data
                }));
            });
        });
    }, [reviews]);

    // ⭐ 리뷰 없을 때
    if (!reviews || reviews.length === 0) {
        return (
            <div className="review-wrapper">
                <div className="review-header-box">
                    <h3 className="review-title">상품 리뷰 (0)</h3>
                </div>
                <div className="review-empty">아직 리뷰가 없습니다.</div>
            </div>
        );
    }

    const avg = reviews.reduce((acc, r) => acc + r.grade, 0) / reviews.length;

    return (
        <div className="review-wrapper">

            {/* ----- 평점 헤더 ----- */}
            <div className="review-header-box">
                <h3 className="review-title">
                    상품 리뷰 ({totalReviews || reviews.length})
                </h3>
                <div className="review-avg-box">
                    <span className="avg-score">{avg.toFixed(1)}</span>
                    <span className="avg-max">/ 5.0</span>
                </div>
            </div>

            <div className="review-list">
                {reviews.map((rev) => {
                    const images = rev.reviewImages || rev.images || [];

                    return (
                        <div key={rev.numRev} className="review-card">

                            <div className="review-card-header">
                                <div className="review-user-info">
                                    <span className="review-writer">{rev.member?.name || "익명"}</span>
                                    <span className="review-date">{rev.created?.substring(0, 10)}</span>
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
                                            toggleReviewGood(rev.numRev)
                                                .then(() => {
                                                    if (refreshReviews) refreshReviews();
                                                });
                                        }}
                                        sx={{
                                            color: likeState[rev.numRev]?.liked ? "#FF7A3C" : "#B5B5B5",
                                            "&:hover": {
                                                transform: "scale(1.15)",
                                                color: "#FF7A3C"
                                            },
                                            transition: "0.2s"
                                        }}
                                    >
                                        {likeState[rev.numRev]?.liked
                                            ? <ThumbUpAltIcon fontSize="medium" />
                                            : <ThumbUpOffAltIcon fontSize="medium" />}
                                        <span style={{ marginLeft: "6px", fontSize: "14px", color: "#333" }}>
                                            {likeState[rev.numRev]?.likeCount ?? 0}
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
                                            setSelectedReviewId(rev.numRev);
                                            setOpenReportModal(true);
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

                            {loggedIn && rev.member?.userId === userId && (
                                <div className="review-actions-my">
                                    <button
                                        className="review-edit-btn"
                                        onClick={() => navigate(`/review/write/${rev.numBrd}?edit=${rev.numRev}`)}
                                    >
                                        수정
                                    </button>

                                    <button
                                        className="review-delete-btn"
                                        onClick={async () => {
                                            if (!window.confirm("정말 삭제하시겠습니까?")) return;
                                            try {
                                                await deleteReviewApi(rev.numRev);
                                                alert("삭제되었습니다.");
                                                if (refreshReviews) refreshReviews();
                                            } catch (e) {
                                                alert("삭제 실패");
                                            }
                                        }}
                                    >
                                        삭제
                                    </button>
                                </div>
                            )}


                            <div className="review-body-row">
                                <div className="review-text">{rev.content}</div>

                                {images.length > 0 && (
                                    <div className="review-image-list right-image">
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
                                                <img className="review-image-thumb" src={getImgSrc(img)} alt="리뷰" />
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
                    );
                })}
            </div>

            {/* ⭐ 페이징 */}
            {totalPages > 1 && (
                <div className="review-pagination">
                    <button disabled={reviewPage === 0} className="page-btn"
                        onClick={() => setReviewPage(reviewPage - 1)}>◀</button>

                    {Array.from({ length: totalPages }, (_, idx) => (
                        <button key={idx}
                            className={`page-btn ${reviewPage === idx ? "active" : ""}`}
                            onClick={() => setReviewPage(idx)}>
                            {idx + 1}
                        </button>
                    ))}

                    <button disabled={reviewPage === totalPages - 1} className="page-btn"
                        onClick={() => setReviewPage(reviewPage + 1)}>▶</button>
                </div>
            )}

            {/* 🔍 이미지 확대 */}
            <Modal open={open} onClose={() => setOpen(false)}>
                <Box className="review-modal-box">
                    <button disabled={selectedIndex === 0}
                        className="modal-arrow-btn"
                        onClick={() => setSelectedIndex(selectedIndex - 1)}>◀</button>

                    {modalImages.length > 0 && (
                        <img src={modalImages[selectedIndex]}
                            alt="리뷰 확대"
                            className="review-modal-img" />
                    )}

                    <button disabled={selectedIndex === modalImages.length - 1}
                        className="modal-arrow-btn"
                        onClick={() => setSelectedIndex(selectedIndex + 1)}>▶</button>
                </Box>
            </Modal>

            {/* 🚨 신고 모달 */}
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
                                    .catch(() => {
                                        alert("이미 신고한 리뷰입니다.");
                                    });
                            }}>신고</button>
                        <button onClick={() => setOpenReportModal(false)}>취소</button>
                    </div>

                </Box>
            </Modal>

        </div>
    );
};

export default DetailReviewList;
