// DetailImages.js
import React, { useState, useRef } from "react";
import Slider from "react-slick";
import "./detail.css";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const DetailImages = ({ images }) => {
    const sliderRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [selectedImg, setSelectedImg] = useState("");
    const [mainIndex, setMainIndex] = useState(0);

    // ⭐ 썸네일 이동 제어
    const [thumbIndex, setThumbIndex] = useState(0);
    const VISIBLE = 5;




    if (!images || images.length === 0) return null;

    const mainImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
    const total = mainImages.length;

    const visibleThumbs = mainImages;

    // ◀ 이전
    const movePrev = () => {
        const newIndex = (mainIndex - 1 + total) % total;
        setMainIndex(newIndex);
        setThumbIndex(newIndex);
        sliderRef.current?.slickGoTo(newIndex);
    };

    // ▶ 다음
    const moveNext = () => {
        const newIndex = (mainIndex + 1) % total;
        setMainIndex(newIndex);
        setThumbIndex(newIndex);
        sliderRef.current?.slickGoTo(newIndex);
    };

    const mainSettings = {
        dots: false,
        infinite: true,
        speed: 400,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        beforeChange: (_, newIndex) => setMainIndex(newIndex),
    };

    return (
        <div className="detail-images">

            {/* ⭐ 메인 이미지 */}
            <div className="main-img-wrapper">
                <Slider ref={sliderRef} {...mainSettings} className="main-slider">
                    {mainImages.map((img, index) => (
                        <div key={index}>
                            <img
                                src={img.path}
                                alt="상품 이미지"
                                className="main-img"
                                onClick={() => {
                                    setSelectedImg(img.path);
                                    setOpen(true);
                                }}
                            />
                        </div>
                    ))}
                </Slider>
            </div>

            {/* ⭐ 썸네일 + 화살표 */}
            <div className="thumb-slider">

                <button className="thumb-arrow" onClick={movePrev}>〈</button>

                <div
                    className="thumb-list"
                >
                    {visibleThumbs.map((thumb, index) => (
                        <img
                            key={index}
                            className={index === mainIndex ? "thumb-item active" : "thumb-item"}
                            src={thumb.path}
                            onClick={() => {
                                setMainIndex(index);
                                sliderRef.current?.slickGoTo(index);
                            }}
                        />
                    ))}
                </div>

                <button className="thumb-arrow" onClick={moveNext}>〉</button>
            </div>

            {/* 🔍 모달 확대 */}
            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    outline: 0
                }}>
                    <img
                        src={selectedImg}
                        alt="확대 이미지"
                        style={{
                            width: "700px",
                            height: "700px",
                            objectFit: "contain",
                            background: "#fff",
                            borderRadius: "10px"
                        }}
                    />
                </Box>
            </Modal>

        </div>
    );
};

export default DetailImages;
