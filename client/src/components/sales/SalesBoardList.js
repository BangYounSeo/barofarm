import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import Popover from "@mui/material/Popover";
import { getLists, getProductItems } from "../../service/SalesList";
import BannerSlide from "./BannerSlide";
import { getMidBanners } from "../../service/BannerService";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SalesBoardList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [filteredList, setFilteredList] = useState([]);
  const [initialized, setInitialized] = useState(false);

  // 페이징
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const size = 6;

  const [activeCategory, setActiveCategory] = useState(null);

  // 카테고리/소분류 팝오버
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [subCategories, setSubCategories] = useState([]);

  // 배너
  const [bannerData, setBannerData] = useState(null);
  const [midBanners, setMidBanners] = useState([]);

  // 현재 선택된 서버 필터
  const [filters, setFilters] = useState({
    productType: null, // 대분류 코드(100, 200, ...)
    productItem: null, // 소분류 itemCode
    keyword: null,
  });

  const categories = [
    { label: "전체보기", type: null, code: null },
    { label: "쌀·잡곡", type: "쌀·잡곡", code: 100 },
    { label: "채소", type: "채소", code: 200 },
    { label: "견과·버섯", type: "견과·버섯", code: 300 },
    { label: "과일", type: "과일", code: 400 },
  ];

  // 미니 배너 로딩
  useEffect(() => {
    (async () => {
      const res = await getMidBanners();
      setMidBanners(res);
    })();
  }, []);

  // 목록 로딩
  const loadList = async ({ pageParam = page, newFilters = filters } = {}) => {
    console.log("🔎 loadList 호출", pageParam, newFilters)
   
    const res = await getLists({
      page: pageParam,
      size,
      ...newFilters,
    });

    const data = res.content ?? res;
    setFilteredList(data);

    const totalItems = res.totalElements ?? (Array.isArray(data) ? data.length : 0);
    // 백엔드에서 totalPages 내려오면 우선 사용
    if (res.totalPages != null) {
      setTotalPages(res.totalPages);
    } else {
      setTotalPages(Math.ceil(totalItems / size));
    }
  };

  // page / filters 바뀔 때마다 목록 다시 로딩
  useEffect(() => {
    if(!initialized) return;

    loadList({
      pageParam: page,
      newFilters: filters,
    });
  }, [page, filters]);

  // 메인/헤더에서 keyword 또는 categoryCode로 진입했을 때 처리
  useEffect(() => {
    // (1) 헤더 검색에서 keyword 넘어온 경우
    if (location.state?.keyword) {
      const kw = location.state.keyword;

      setPage(1);
      setFilters(prev => ({
        ...prev,
        keyword: kw,
        productType: null,
        productItem: null,
      }));
      setActiveCategory(null);
      setBannerData(null);
      setInitialized(true);
      return;
    }

    // (2) 메인페이지에서 categoryCode가 넘어온 경우
    if (location.state?.categoryCode) {
      const code = location.state.categoryCode;

      setPage(1);
      setFilters({
        productType: code,
        productItem: null,
        keyword: null,
      });
      setActiveCategory(code);
      setBannerData(null);
      setInitialized(true);
      return;
    }

    // (3) 아무 state도 없으면 전체보기 초기화
    setPage(1);
    setFilters({
      productType: null,
      productItem: null,
      keyword: null,
    });
    setActiveCategory(null);
    setBannerData(null);
    setInitialized(true);
  }, [location.state]);

  // 대분류 클릭
  const filterByCategory = async (event, type, code) => {
    setPage(1);

    // 전체보기
    if (type === null) {
      setActiveCategory(null);
      setAnchorEl(null);
      setSubCategories([]);
      setFilters({
        productType: null,
        productItem: null,
        keyword: null, // 검색어도 초기화
      });
      setBannerData(null);
      return;
    }

    // 특정 카테고리
    setActiveCategory(code);
    setAnchorEl(event.currentTarget);

    const sub = await getProductItems(code);
    setSubCategories(sub);
    setBannerData(null);
  };

  // 팝오버 안의 "전체" (해당 대분류의 소분류 전체)
  const filterByCategoryAll = () => {
    setAnchorEl(null);
    setPage(1);
    setFilters(prev => ({
      ...prev,
      productType: activeCategory,
      productItem: null, // 대분류는 그대로, 소분류만 해제
    }));
    // 소분류 배너도 초기화
    setBannerData(null);
  };

  // 소분류 클릭
  const filterBySubCategory = async (itemCode) => {
    setAnchorEl(null);
    setPage(1);
    setFilters(prev => ({
      ...prev,
      productItem: itemCode,
    }));

    try {
      const resultPrice = await fetch(
        `api/detail/daily-price/yesterday?itemCode=${itemCode}`
      ).then(res => res.json());

      setBannerData(resultPrice);
    } catch (e) {
      console.error("가격정보 로딩 실패:", e);
      setBannerData(null);
    }
  };

  const goPrev = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  const goNext = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  return (
    <>
      {/* 미드 배너 */}
      <Slider
        dots={true}
        infinite={true}
        speed={500}
        slidesToShow={1}
        slidesToScroll={1}
        autoplay={true}
        autoplaySpeed={4000}
      >
        {midBanners.map((b) => (
          <Box
            key={b.bannerId}
            sx={{
              position: "relative",
              height: 200,
              cursor: b.linkUrl ? "pointer" : "default",
              mt: "20px",
            }}
            onClick={() => b.linkUrl && navigate(b.linkUrl)}
          >
            {/* 이미지 */}
            <img
              src={b.imageUrl}
              alt="mid-banner"
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
              }}
            />

            {/* 메인 문구 */}
            {b.mainText && (
              <Typography
                sx={{
                  position: "absolute",
                  top: "35%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "#fff",
                  fontSize: "20px",
                  fontWeight: 700,
                  textShadow: "0 3px 8px rgba(0,0,0,0.6)",
                  textAlign: "center",
                  whiteSpace: "pre-line",
                }}
              >
                {b.mainText}
              </Typography>
            )}

            {/* 서브 문구 */}
            {b.subText && (
              <Typography
                sx={{
                  position: "absolute",
                  top: "65%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 400,
                  textShadow: "0 3px 8px rgba(0,0,0,0.6)",
                  textAlign: "center",
                  whiteSpace: "pre-line",
                }}
              >
                {b.subText}
              </Typography>
            )}
          </Box>
        ))}
      </Slider>

      <Box
        sx={{
          pt: { xs: "0px", sm: "5px", md: "30px" },
          px: 2,
          maxWidth: "100%",
          mx: "auto",
        }}
      >
        {/* 카테고리 영역 */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: { xs: 2, md: 1.5 }, mb: { xs: 2, md: 3 } }}
        >
          <Stack
            direction="row"
            sx={{
              mt: { xs: 2, md: 7 },
              mb: { xs: 2, md: 2 },
              px: { xs: 2, md: 13 },
              flexWrap: "wrap",
              gap: "15px",
              justifyContent: { xs: "center", md: "flex-start" },
              ml: { xs: 0, md: -4 },
            }}
          >
            {categories.map((c) => (
              <Box
                key={c.label}
                onClick={(e) => filterByCategory(e, c.type, c.code)}
                sx={{
                  px: { xs: 1, md: 3 },
                  py: { xs: 0.5, md: 1.2 },
                  borderRadius: "20px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontSize: "15px",
                  background:
                    activeCategory === c.code ? "#ffe9d6" : "#f7f7f7",
                  "&:hover": { background: "#ffe9d6" },
                }}
              >
                {c.label}
              </Box>
            ))}
          </Stack>
        </Stack>

        {/* 가격 배너 슬라이드 (소분류 선택 시) */}
        {bannerData && (
          <BannerSlide
            retail={bannerData.retail}
            wholesale={bannerData.wholesale}
          />
        )}

        {/* 제목 */}
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#555",
            mb: 5,
            mt: 5,
            pb: 1,
            justifyContent: "center",
            width: "1070px",
            mx: "auto",
            borderBottom: "1px solid #eee",
          }}
        >
          상품 목록
        </Typography>

        {/* 소분류 팝오버 */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          disableScrollLock={true}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          PaperProps={{
            sx: {
              mt: 1,
              p: 1.5,
              borderRadius: "12px",
              boxShadow: "0px 4px 20px rgba(0,0,0,0.15)",
              maxHeight: "300px",
              overflowY: "auto",
            },
          }}
        >
          <Stack sx={{ minWidth: "80px" }}>
            <Box
              onClick={filterByCategoryAll}
              sx={{
                px: 2,
                py: 1,
                mb: 0.5,
                cursor: "pointer",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#ff7043",
                borderBottom: "1px solid #eee",
                "&:hover": { background: "#ffe9d6" },
              }}
            >
              전체
            </Box>

            {subCategories.map((sub) => (
              <Box
                key={sub.itemCode}
                onClick={() => filterBySubCategory(sub.itemCode)}
                sx={{
                  px: 2,
                  py: 1,
                  cursor: "pointer",
                  borderRadius: "8px",
                  fontSize: "14px",
                  "&:hover": { background: "#ffe9d6" },
                }}
              >
                {sub.itemName}
              </Box>
            ))}
          </Stack>
        </Popover>

        {/* 상품 카드들 */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "35px",
            justifyContent: "center",
            maxWidth: "1100px",
            mx: "auto",
          }}
        >
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <Paper
                key={item.numBrd}
                onClick={() => navigate(`/detail/${item.numBrd}`)}
                sx={{
                  width: { xs: "90%", sm: "45%", md: "30%" },
                  height: "330px",
                  borderRadius: "15px",
                  border: "1px solid #eee",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  overflow: "hidden",
                  cursor: "pointer",
                  position: "relative",
                  "&:hover": {
                    transform: "scale(1.03)",
                    transition: "0.2s",
                    borderColor: "#ffb088",
                  },
                }}
              >
                {/* 품절 오버레이 */}
                {(item.stock === 0 || item.status === "stop") && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: "rgba(0,0,0,0.55)",
                      color: "#fff",
                      fontSize: "28px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 20,
                      pointerEvents: "none",
                    }}
                  >
                    품절
                  </Box>
                )}

                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt={item.subject}
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                )}

                <Typography sx={{ mt: 1.5, fontSize: "21px", ml: 2 }}>
                  <span
                    style={{ fontWeight: 700, color: "#d32f2f" }}
                  >
                    {item.price?.toLocaleString()}
                  </span>
                  <span
                    style={{ fontWeight: 500, color: "#d32f2f" }}
                  >
                    원
                  </span>
                </Typography>

                <Typography
                  sx={{
                    fontSize: "14px",
                    ml: 2,
                    mt: 0.5,
                    maxWidth: "90%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.subject}
                </Typography>
              </Paper>
            ))
          ) : (
            <Typography sx={{ mt: 5, mx: "auto" }}>
              검색 또는 카테고리 조건에 맞는 상품이 없습니다.
            </Typography>
          )}
        </Box>

        {/* 페이징 UI */}
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="center"
          sx={{ mt: 6, mb: 10 }}
        >
          {/* 이전 버튼 */}
          <Button
            disabled={page === 1}
            onClick={goPrev}
            sx={{
              background: "#FFE9D6",
              color: "#000",
              borderRadius: "8px",
              px: 1.5,
              minWidth: "35px",
              fontWeight: 700,
              boxShadow: "none",
              textTransform: "none",
              "&:hover": {
                background: "#FFDCC8",
              },
            }}
          >
            이전
          </Button>

          {/* 페이지 번호 */}
          {[...Array(totalPages)].map((_, i) => {
            const isActive = page === i + 1;
            return (
              <Button
                key={i}
                onClick={() => setPage(i + 1)}
                sx={{
                  color: "#000",
                  borderRadius: "8px",
                  px: 1.5,
                  minWidth: "28px",
                  fontWeight: isActive ? 900 : 600,
                  background: isActive
                    ? " #ecb6a3ff"
                    : " #FFE9D6",
                  boxShadow: "none",
                  textTransform: "none",
                  transition: ".15s",
                  "&:hover": {
                    background: "#FFDCC8",
                  },
                }}
              >
                {i + 1}
              </Button>
            );
          })}

          {/* 다음 버튼 */}
          <Button
            disabled={page === totalPages}
            onClick={goNext}
            sx={{
              background: "#FFE9D6",
              color: "#000",
              borderRadius: "8px",
              px: 1.5,
              minWidth: "35px",
              fontWeight: 700,
              boxShadow: "none",
              textTransform: "none",
              "&:hover": {
                background: "#FFDCC8",
              },
            }}
          >
            다음
          </Button>
        </Stack>
      </Box>
    </>
  );
};

export default SalesBoardList;
