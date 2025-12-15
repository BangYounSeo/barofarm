import React, { useState, useContext, useEffect } from "react";
import { MemberContext } from "../member/login/MemberContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

// ⭐ 수정 기능 추가: updateReview API import
import { saveReview, updateReview, getReviewDetail } from "../../service/ReviewService";

const ReviewWrite = () => {
    const { loggedIn, userId } = useContext(MemberContext);
    const { numBrd } = useParams();
    const navigate = useNavigate();
    const location = useLocation();   // ⭐ 추가된 부분!



    // ⭐ 추가: 수정 모드인지 체크
    const searchParams = new URLSearchParams(location.search);
    const editNumRev = searchParams.get("edit"); // null이면 등록, 숫자면 수정 모드

    const [content, setContent] = useState("");
    const [grade, setGrade] = useState(5);
    const [images, setImages] = useState([]);
    const [oldImages, setOldImages] = useState([]); // 기존 이미지 표시용

const [previewImages, setPreviewImages] = useState([]); 
    // ⭐ ⭐ 수정 모드일 경우 기존 리뷰 불러오기
    useEffect(() => {
        if (!editNumRev) return; // 등록 모드면 무시

        const loadOldReview = async () => {
            try {
                const res = await getReviewDetail(editNumRev);

                setContent(res.content);
                setGrade(res.grade);
                setOldImages(res.images || []);
            } catch (err) {
                console.error("기존 리뷰 로딩 실패:", err);
            }
        };

        loadOldReview();
    }, [editNumRev]);



    const handleStarClick = (value) => setGrade(value);

    // ⭐ 등록 / 수정 공통 처리
    const handleSubmit = async () => {
        if (!loggedIn) return alert("로그인이 필요합니다.");
        if (!content.trim()) return alert("리뷰 내용을 입력해주세요.");

        const formData = new FormData();
        formData.append("content", content);
        formData.append("grade", grade);
        formData.append("numBrd", numBrd);
        formData.append("userId", userId);

        images.forEach((file) => {
            formData.append("images", file);
        });

        try {
            // ⭐ 수정 모드 → updateReview 호출
            if (editNumRev) {
                await updateReview(editNumRev, formData);
                alert("리뷰가 수정되었습니다!");
            }
            // ⭐ 등록 모드 → saveReview 호출
            else {
                await saveReview(formData);
                alert("리뷰가 등록되었습니다!");
            }

            navigate(`/detail/${numBrd}`);
        } catch (err) {
            console.error(err);
            alert(editNumRev ? "리뷰 수정 실패" : "리뷰 등록 실패");
        }
    };

    const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // 실제 업로드용 File 추가
    setImages((prev) => [...prev, ...files]);

    // 미리보기 URL 생성
    const previewUrls = files.map((file) => URL.createObjectURL(file));

    // 기존 미리보기 + 신규 미리보기 추가
    setPreviewImages((prev) => [...prev, ...previewUrls]);
};

    return (
        <div className="review-write-container">
            {/* ⭐ 수정 시 제목 변경 */}
            <h2 className="review-write-title">
                {editNumRev ? "리뷰 수정" : "상품 리뷰 작성"}
            </h2>

            {/* 평점 */}
            <div className="review-write-box">
                <label className="review-write-label">평점</label>
                <div className="star-wrapper">
                    {[1, 2, 3, 4, 5].map((v) => (
                        <span
                            key={v}
                            className={`star ${v <= grade ? "on" : ""}`}
                            onClick={() => handleStarClick(v)}
                        >
                            ★
                        </span>
                    ))}
                </div>
            </div>

            {/* 내용 */}
            <div className="review-write-box">
                <label className="review-write-label">내용</label>
                <textarea
                    className="review-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="상품은 어떠셨나요?"
                />
            </div>

            {/* ⭐ 기존 이미지 표시 (수정 모드일 때만) */}
            {editNumRev && oldImages.length > 0 && (
                <div className="review-write-box">
                    <label className="review-write-label">기존 업로드 사진</label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {oldImages.map((img) => (
                            <img
                                key={img.numRevImg}
                                src={img.url}
                                alt="old"
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 8,
                                    objectFit: "cover",
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
                {previewImages.length > 0 && (
                <div className="review-write-box">
                    <label className="review-write-label">새로 선택한 사진</label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {previewImages.map((src, idx) => (
                            <img
                                key={idx}
                                src={src}
                                alt="preview"
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 8,
                                    objectFit: "cover",
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* 이미지 첨부 */}
            <div className="review-write-box">
                <label className="review-write-label">사진 첨부</label>
                <input
                    className="review-file-input"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    onClick={(e) => (e.target.value = null)}
                />
            </div>

            {/* 버튼 */}
            <div className="review-write-btns">
                <button
                    className="cancel-btn"
                    onClick={() => navigate(`/detail/${numBrd}`)}
                >
                    취소
                </button>

                {/* ⭐ 등록/수정 버튼 변경 */}
                <button className="submit-btn" onClick={handleSubmit}>
                    {editNumRev ? "수정하기" : "등록하기"}
                </button>
            </div>
        </div>
    );
};

export default ReviewWrite;
