// ⭐⭐ 변경된 PhotoReviewGallery.js
import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import "./detail.css";

const PhotoReviewGallery = ({ reviews, onOpenDetail, onSelectReview }) => {
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

    const [openAll, setOpenAll] = useState(false);

    if (!reviews || reviews.length === 0) return null;

    const photoList = [];
    reviews.forEach((review, rIndex) => {
        const images = review.reviewImages || review.images || [];

        images.forEach((img) => {
            const url = getImgSrc(img);
            if (!url) return;

            photoList.push({
                url,
                reviewIndex: rIndex,
                totalImages: images.length
            });
        });
    });

    return (
        <div className="photo-review-wrapper">

            <div className="photo-title">
                포토&동영상 리뷰 {photoList.length}건
            </div>

            <div className="photo-scroll-box">
                <div className="photo-list">
                    {photoList.slice(0, 10).map((item, idx) => (
                        <div
                            key={idx}
                            className="photo-item"
                            onClick={() => onSelectReview(item.reviewIndex)}
                        >
                            <div className="review-image-wrapper">
                                <img
                                    src={item.url}
                                    alt="포토리뷰"
                                    className="photo-thumb"
                                />

                                {/* ⭐ +N 표시 */}
                                {item.totalImages > 1 && (
                                    <div className="review-more-count">
                                        +{item.totalImages - 1}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {photoList.length > 10 && (
                        <div className="photo-more-btn"
                            onClick={() => {
                                setOpenAll(true);
                                onOpenDetail();
                            }}
                        >
                            더보기
                        </div>
                    )}
                </div>
            </div>

            <Modal open={openAll} onClose={() => setOpenAll(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "#fff",
                        p: 2,
                        borderRadius: "10px",
                        maxHeight: "90vh",
                        overflowY: "auto"
                    }}
                >
                    <div className="photo-modal-all">
                        {photoList.map((item, idx) => (
                            <img
                                key={idx}
                                src={item.url}
                                className="photo-modal-thumb"
                                alt="포토리뷰"
                            />
                        ))}
                    </div>
                </Box>
            </Modal>

        </div>
    );
};

export default PhotoReviewGallery;
