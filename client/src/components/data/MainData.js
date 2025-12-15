// src/pages/MainData.js
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../service/AxiosConfig"; // 맨 위에 추가
import { useMediaQuery } from "@mui/material";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Stack,
  Button,
  Autocomplete,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

import MainTable from "./MainTable";
import EasyPriceDailyGraph from "./searchEasily/EasyPriceDailyGraph";
import InfoCard from "./InfoCard";
import conveniencePriceDataIcon from '../../assets/icons/conveniencePriceDataIcon.png'
import aiPriceIcon from '../../assets/icons/aiPriceIcon.png'
import detailPriceDataIcon from '../../assets/icons/detailPriceDataIcon.png'

import Expected_MarketPriceGraph from "./searchEasily/Expected_MarketPriceGraph";
import dayjs from "dayjs";
import { getPopularProducts } from "../../service/SalesList";


export default function MainData() {

  const [itemOptions, setItemOptions] = useState([]);
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  const [tab, setTab] = useState("type2");
  const [highlightIndex, setHighlightIndex] = useState(0);



  //  실제 쇼핑 인기상품 (조회수 기반)
  const [shoppingList, setShoppingList] = useState([]);

  // ⭐ 시세 인기검색어 리스트 
  const [popularList, setPopularList] = useState([]);
  const [type2List, setType2List] = useState([]);

  const currentList = tab === "type1" ? popularList : type2List
  const highlightedItem = currentList[highlightIndex];


  // 품목 리스트 불러오기
  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await api.get("/easy-price/items/distinct/kind01");
        const list = res.data;
        setItemOptions(list.sort((a, b) => a.localeCompare(b, "ko-KR")));
      } catch (err) {
        console.error("ITEM API ERROR:", err);
      }
    };
    loadItems();
  }, []);

  // ⭐ 알뜰소비품목 Top7 (direction = 0, value DESC)
useEffect(() => {
  const loadCheapItems = async () => {
    try {
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .slice(0, 10);

      const res = await api.get("/daily/sales/list/cheap-items", {
        params: {
          regday: yesterday, // 2025-12-09 이런 형식
          clsCode: "01",     // 소매
        },
      });

      const list = Array.isArray(res.data) ? res.data : [];
      console.log("💸 알뜰소비 Top7:", list);

      setType2List(list);
    } catch (err) {
      console.error("CHEAP ITEMS ERROR:", err);
    }
  };

  loadCheapItems();
}, []);

// 시세 인기품목 API (type1)
useEffect(() => {
  async function loadPopularKeywords() {
    try {
      const res = await api.get("/data/popular-products");
      const list = Array.isArray(res.data) ? res.data : [];

      console.log("🔥 시세 인기검색어 원본 :", list);
      setPopularList(list.slice(0, 7));
    } catch (err) {
      console.error("POPULAR KEYWORDS ERROR:", err);
    }
  }
  loadPopularKeywords();
}, []);


// 쇼핑 인기상품 Top7 불러오기 
useEffect(() => {
    async function loadPopularProducts() {
      try {
        const data = await getPopularProducts();
        console.log("🔥 쇼핑 인기상품 조회수 TOP7:", data);

        setShoppingList(data); // 캐러셀 데이터
      } catch (err) {
        console.error("POPULAR PRODUCTS ERROR:", err);
      }
    }
    loadPopularProducts();
  }, []);



  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .slice(0, 10);

  //interval Id저장할 ref
  const timerRef = useRef(null);

  //자동 변경용 interval 생성
  const startInterval = () => {
    timerRef.current = setInterval(() => {
      setHighlightIndex((prev) =>
        currentList.length > 0 ? (prev + 1) % currentList.length : 0
      );
    }, 10000);
  };

  //최초실행
  useEffect(() => {
    startInterval();
    return () => clearInterval(timerRef.current);
  }, []);

  //유저가 클릭하면 타이머 리셋하기
  const handleChangeIndex = (index) => {
    setHighlightIndex(index);
    //기존 interval정지
    clearInterval(timerRef.current);
    //10초마다 타이머 다시 시작
    startInterval();
  };

  const handleGraphClick = () => {
    console.log("highlightedItem:", highlightedItem);
    if (!highlightedItem) return;

    const item = highlightedItem;
    const code = item.product_cls_code || item.productClsCode;

    navigate(
      highlightedItem.productClsCode === "01"
        ? "/data/search/b2c"
        : "/data/search/b2b",
      {
        state: {
          itemName: highlightedItem.itemName,
          regday: yesterday,
          clsCode: highlightedItem.productClsCode,
        }
      }
    );
  };

  // 🔻 쇼핑 인기리스트 캐러셀 상태
  const [carouselIndex, setCarouselIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width:600px)");
  const VISIBLE_COUNT = isMobile ? 1 : 4;

  const maxIndex =
    shoppingList.length > VISIBLE_COUNT
      ? shoppingList.length - VISIBLE_COUNT
      : 0;

  const handlePrev = () => {
    setCarouselIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCarouselIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const visibleItems = shoppingList.slice(
    carouselIndex,
    carouselIndex + VISIBLE_COUNT
  );

  const formatPrice = (price) =>
    price.toLocaleString("ko-KR", { maximumFractionDigits: 0 });

  return (
    <Box sx={{ width: "90%", maxWidth: "1500px", mx: "auto", py: 5 }}>
      {/* 상단 히어로 영역 */}
      <Paper
        elevation={0}
        sx={{
          mb: 5,
          p: 4,
          borderRadius: 4,
          background:
            "linear-gradient(135deg, #f7f9ff 0%, #fdfbff 40%, #ffffff 100%)",
          border: "1px solid #f0ecff",
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: "#6E63E8", fontWeight: 700, letterSpacing: 3 }}
        >
          농산물 시세추이 정보시스템
        </Typography>

        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: "#222", lineHeight: 1.3 }}
        >
          <Box component="span" sx={{ color: "#6E63E8" }}>
            &quot;바로팜&quot;
          </Box>
          에서
          <br />
          농산물 가격 정보를 한눈에 확인하세요.
        </Typography>

        <Typography variant="body1" sx={{ color: "#666", mt: 1 }}>
          전국 도매·소매 시장 가격, 평년 대비 추이, 예상 판매가까지
          <br />
          생산자와 소비자가 함께 활용할 수 있는 시세 플랫폼입니다.
        </Typography>

        <Box
          sx={{
            mt: 3,
            display: "flex",
            gap: 2,
            alignItems: "center",
            maxWidth: 520,
          }}
        >

 <Autocomplete
    options={itemOptions}
    value={searchInput}
    onChange={(e, v) => {
      if (v) setSearchInput(v);
    }}
    sx={{ flex: 1 }}
    renderInput={(params) => (
      <TextField
        {...params}
        placeholder="품목을 입력해 보세요."
        size="medium"
        InputProps={{
          ...params.InputProps,
          sx: {
            borderRadius: 999,
            backgroundColor: "#fff",
          },
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => {
                  if (!searchInput) return;
                  navigate("/data/search/b2c", {
                    state: {
                      itemName: searchInput,
                      regday: dayjs()
                        .subtract(1, "day")
                        .format("YYYY-MM-DD"),
                      clsCode: "01",
                      autoFocus: true,
                    },
                  });
                }}
              >
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    )}
  />
<Button
    variant="contained"
    sx={{
      borderRadius: 999,
      px: 3,
      py: 1,
      backgroundColor: "#6E63E8",
      "&:hover": { backgroundColor: "#5a51d6" },
      whiteSpace: "nowrap",
    }}
    onClick={() => {
      if (!searchInput) return;
      navigate("/data/search/b2c", {
        state: {
          itemName: searchInput,
          regday: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
          clsCode: "01",
          autoFocus: true,
        },
      });
    }}
  >
              바로 조회
            </Button>
          </Box>
      </Paper> 

{/* 그래프 + 테이블 */}
<h5>  
※ 검색어 인기품목은 KAMIS API와 네이버 데이터랩(쇼핑인사이트,검색어트랜드)을 활용했습니다.
</h5>  
      <Box
        sx={{
          width: { xs: "100%", sm: "95%", md: "90%" }, // 섹션 자체 폭
          maxWidth: 1100,                               // 너무 넓어지지 않게
          mx: "auto",                                   // 항상 가운데 정렬
          mt: 1,
        }}
      >
<Grid
  container
  rowSpacing={3}                                  // 위/아래 간격
  columnSpacing={{ xs: 0, md: 4, lg: 6 }}         // 좌/우 간격 (적당한 값으로)
  sx={{ width: "100%", m: 0 }}
>
  {/* Left: 테이블 */}
<Grid
  item
  xs={12}
  md={4}
  lg={4}
  order={{ xs: 1, md: 1 }}
  sx={{
    pl: { md: 2, lg: 0 },              // PC에서만 살짝 왼쪽 여백
    boxSizing: "border-box",
  }}
>
  {/* 👉 여기 Box를 수정 */}
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      display: "flex",
      justifyContent: { xs: "center", md: "flex-start" }, // 모바일: 가운데, PC: 왼쪽
    }}
  >
    <Box
      sx={{
        width: { xs: "100%", sm: "100%", md: "100%" },      // 모바일에서 좌우 여백 조금
        maxWidth: 300,                                     // 너무 넓어지지 않게 최대폭 제한
      }}
    >
      <MainTable
        tab={tab}
        setTab={setTab}
        currentList={currentList}
        highlightIndex={highlightIndex}
        setHighlightIndex={handleChangeIndex}
      />
    </Box>
  </Box>
</Grid>


  {/* Right: 그래프들 */}
  <Grid
    item
    xs={12}
    md={8}
    lg={8}
    order={{ xs: 2, md: 2 }}
    sx={{
      px: { xs: 0, md: 1, lg: 2 },
      minWidth: 0,
    }}
  >
    {/* 세로로 정렬 + 간격 확보 */}
    <Stack spacing={1}>

{/* 일일 시세 그래프 */}
<Box sx={{ width: "100%", aspectRatio: { xs: "4 / 3", md: "16 / 9" } }}>
  <EasyPriceDailyGraph
    itemName={highlightedItem?.itemName}
    regday={yesterday}
    clsCode={highlightedItem?.productClsCode}
    productClsName={highlightedItem?.productClsName}
    onGraphClick={handleGraphClick}
  />
</Box>

{/* AI 예측 그래프 */}
<Box sx={{ mt: 3, width: "100%", aspectRatio: { xs: "4 / 3", md: "16 / 9" } }}>
  <Expected_MarketPriceGraph
    itemName={highlightedItem?.itemName}
    regday={yesterday}
    clsCode={highlightedItem?.productClsCode}
    productClsName={highlightedItem?.productClsName}
  />
</Box>

    </Stack>
  </Grid>
</Grid>
 </Box>
      {/* ===================== Info Cards ===================== */}
      <Box sx={{ mt: 6 }}>
        <Stack spacing={2}>
          <InfoCard title="상세 가격정보" to="/data/detail"
            img={detailPriceDataIcon} />
          <InfoCard title="간편 가격정보" to="/data/search/b2c"
            img={conveniencePriceDataIcon} />
          <InfoCard title="AI 가격예측" to="/data/pricePredict"
            img={aiPriceIcon} />
        </Stack>
      </Box>

      {/* 바로팜 쇼핑 인기리스트 - 캐러셀 */}
      <Box sx={{ mt: 7 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2, color: "#222" }}
        >
          바로팜 쇼핑 인기리스트
        </Typography>

        <Paper
          elevation={1}
          sx={{
            p: 2.5,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <IconButton
            onClick={handlePrev}
            disabled={carouselIndex === 0}
            sx={{ borderRadius: 999, border: "1px solid #eee" }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>

          <Box
            sx={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: { xs: "1fr",       
                sm: "repeat(2, 1fr)",
                md: "repeat(4, minmax(0, 1fr))",},
              gap: 2,
            }}
          >
            {visibleItems.map((item) => (
              <Card
                key={item.numBrd}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/detail/${item.numBrd}`)}
                  sx={{ height: "100%" }}
                >

                  {/* 🔥 품절 오버레이 */}
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
                        fontSize: "24px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 20,
                        pointerEvents: "none"
                      }}
                    >
                      품절
                    </Box>
                  )}
                  <CardMedia
                    component="img"
                    height="150"
                    image={item.thumbnail}
                    alt={item.subject}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ pt: 1.5, pb: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: "#D32F2F",
                        mb: 0.5,
                        fontSize: 16,
                      }}
                    >
                      {formatPrice(item.price)}원
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#333" }}
                      noWrap
                    >
                      {item.subject}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#888", display: "block", mt: 0.5 }}
                      noWrap
                    >
                      {item.seller}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>

          <IconButton
            onClick={handleNext}
            disabled={carouselIndex === maxIndex}
            sx={{ borderRadius: 999, border: "1px solid #eee" }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );
}