import React, { useEffect, useState } from "react";
import api from "../../service/AxiosConfig";
import { Box, Typography, Stack, Paper, Container } from "@mui/material";
import { ReactComponent as WheatIcon } from "../../assets/icons/free-icon-font-wheat-7409774.svg";
import { ReactComponent as LettuceIcon } from "../../assets/icons/free-icon-font-lettuce-7409426.svg";
import { ReactComponent as AppleIcon } from "../../assets/icons/free-icon-font-apple-crate-9275645.svg";
import { ReactComponent as MushroomIcon } from "../../assets/icons/free-icon-font-mushroom-alt-12948378.svg";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getMainBanners, getMidBanners } from "../../service/BannerService";
import MainEasyPriceCarousel from "../data/searchEasily/MainEasyPriceCarousel";

import { getLists, getBestProducts, getNewProducts } from "../../service/SalesList";

let productCache = null;


export default function MainPage() {


  const [productList, setProductList] = useState([])
  const navigate = useNavigate()
  const [banners, setBanners] = useState([]) //DB 배너 상태 추가
  const [midBanners, setMidBanners] = useState([]) //중간 배너
  const [bestList, setBestList] = useState([])
  const [newList, setNewList] = useState([])

  //메인 배너 불러오기
  useEffect(() => {
    (async () => {
      const res = await getMainBanners()
      setBanners(Array.isArray(res) ? res : [])
    })()
  }, [])

  //중간 배너
  useEffect(() => {
    (async () => {
      const res = await getMidBanners()
      setMidBanners(Array.isArray(res) ? res : [])
    })()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        //전체상품 유지 (기존 로직)
        const all = await getLists()
        setProductList(all)

        //베스트상품 API 적용
        const best = await getBestProducts()
        setBestList(best)

        //신상품 API 적용
        const news = await getNewProducts()
        setNewList(news)

      } catch (error) {
        console.error(error)
      }
    })()
  }, [])

  const categories = [
    {
      icon: <WheatIcon className="cat-icon" />,
      label: "쌀·잡곡", code: 100,
      hoverColor: "#ff9800", hoverBg: "#fff3e0"
    },
    {
      icon: <LettuceIcon className="cat-icon" />,
      label: "채소", code: 200,
      hoverColor: "#4caf50", hoverBg: "#e8f5e9"
    },
    {
      icon: <MushroomIcon className="cat-icon" />,
      label: "견과·버섯", code: 300,
      hoverColor: "#c49300ff", hoverBg: "#dee4ffff"
    },
    {
      icon: <AppleIcon className="cat-icon" />,
      label: "과일", code: 400,
      hoverColor: "#ff7e7eff", hoverBg: "#fce4ec"
    }
  ]

  //캐러셀 옵션
  const bannerSettings = {
    dots: true,
    autoplay: true,
    arrows: false,
    infinite: true,
    speed: 700,
    autoplaySpeed: 3500
  }

  return (
    <Box sx={{ width: "100%", pt: "20px" }}>

      {banners.length > 0 && (
        <Box sx={{ width: "100%", mb: 0, p: 0 }}>
          <Slider {...bannerSettings}>
            {banners.map((b) => (
              <Box
                key={b.bannerId}
                sx={{
                  height: 500,
                  position: "relative",
                  cursor: b.linkUrl ? "pointer" : "default"
                }}
                onClick={() => b.linkUrl && navigate(b.linkUrl)}
              >
                <img
                  src={b.imageUrl}
                  alt="banner"
                  style={{
                    width: "100%",
                    height: "500px",
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
                      fontSize: "42px",
                      fontWeight: 700,
                      textShadow: "0 3px 10px rgba(0,0,0,0.6)",
                      textAlign: "center",
                      whiteSpace: "nowrap",
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
                      top: "55%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "#fff",
                      fontSize: "20px",
                      fontWeight: 400,
                      textShadow: "0 3px 10px rgba(0,0,0,0.6)",
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
        </Box>
      )}

      {/* 🔹 오늘의 시세 위젯 */}
      <MainEasyPriceCarousel />

      {/* 기존 하드코딩된 메인 배너 제거 */}
      {/* <Box sx={{
        background: "#f3f8f3", py: 6, textAlign: "center", height: 400,
        backgroundImage: "url('/pexels1.jpg')",
        backgroundSize: "cover", backgroundPosition: "center",
        color: "#fff", display: "flex", justifyContent: "center",
        alignItems: "center"
      }}>
        <Box>
          <Typography sx={{ fontSize: "32px", fontWeight: 600 }}>
            신선한 산지 직송 농산물
          </Typography>
          <Typography sx={{ mt: 1, color: "#fff" }}>
            오늘도 좋은 상품을 소개합니다 🍎
          </Typography>
        </Box>
      </Box>

      <Container sx={{ mt: 4 }}>
        <Stack direction="row" flexWrap="wrap"
          sx={{ gap: "50px", justifyContent: "center" }}>
          {categories.map((c) => (
            <Box key={c.label}
              onClick={() => navigate("/salesboard", { state: { categoryCode: c.code } })}
              sx={{
                display: "flex", flexDirection: "column",
                alignItems: "center", cursor: "pointer"
              }}>
              <Box sx={{
                width: { xs: "80px", sm: "90px", md: "110px" },
                height: { xs: "80px", sm: "90px", md: "110px" },
                transition: "0.25s", justifyContent: "center",
                borderRadius: "15px", display: "flex", alignItems: "center",
                "&:hover": {
                  transform: "scale(1.13)",
                  backgroundColor: c.hoverBg
                },
                "& .cat-icon": {
                  width: { xs: "35px", sm: "42px", md: "50px" },
                  height: { xs: "35px", sm: "42px", md: "50px" }
                },
                "& .cat-icon path": { fill: "#000", transition: "0.2s" },
                "&:hover .cat-icon path": { fill: c.hoverColor }
              }}>
                {c.icon}
              </Box>

              <Typography sx={{ mt: 1.5, fontSize: { xs: "14px", sm: "15px", md: "16px" } }}>
                {c.label}
              </Typography>

            </Box>
          ))}
        </Stack>
      </Container>

      {/* 베스트상품 */}
      <Container sx={{ mt: 10 }}>
        <Typography variant="h5" sx={{ mb: 3, ml: 4, fontWeight: 500 }}>
          베스트 상품
        </Typography>

        <Box sx={{
          display: "flex", flexWrap: "wrap",
          gap: "25px", justifyContent: "flex-start",
          maxWidth: "1100px", mx: "auto"
        }}>
          {bestList.length > 0 ? (
            bestList.map((item) => (
              <Paper
                key={item.numBrd}
                onClick={() => navigate(`/detail/${item.numBrd}`)}
                sx={{
                  position: "relative",
                  width: "250px", height: "315px", borderRadius: "12px",
                  border: "1px solid #ececec", display: "flex",
                  flexDirection: "column", alignItems: "flex-start",
                  overflow: "hidden", cursor: "pointer", transition: "0.2s",
                  "&:hover": { transform: "scale(1.03)", borderColor: "#ffb088" }
                }}
              >

                {/* 품절 오버레이 */}
                {item.stock === 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: "rgba(0, 0, 0, 0.55)",
                      color: "#fff",
                      fontSize: "28px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                      pointerEvents: "none"
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
                      width: "100%", height: "230px",
                      objectFit: "cover", display: "block"
                    }}
                  />
                )}

                <Typography sx={{ mt: 2, fontSize: "18px", ml: 2 }}>
                  <span style={{ fontWeight: 700, color: "#d32f2f" }}>
                    {item.price?.toLocaleString()}
                  </span>
                  <span style={{ fontWeight: 500, color: "#d32f2f" }}>원</span>
                </Typography>

                <Typography sx={{
                  fontSize: "14px", ml: 2, mt: 0.5,
                  maxWidth: "90%", whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis"
                }}>
                  {item.subject}
                </Typography>
              </Paper>
            ))
          ) : (
            <Typography>상품 로딩 중...</Typography>
          )}
        </Box>
      </Container>

      {/* 중간 미니 배너 */}
      {/* <Box sx={{
        mt: 8, backgroundImage: "url('/1121.png')",
        textAlign: "center", height: "160px"
      }}>
        이벤트/공지 사진 배너
      </Box> */}

      {/* 중간 배너 (DB 기반) */}
      {midBanners.length > 0 && (
        <Box sx={{ width: "100%", mb: 0, p: 0, mt: 8 }}>
          <Slider {...bannerSettings}>
            {midBanners.map((b) => (
              <Box
                key={b.bannerId}
                sx={{
                  position: "relative",
                  height: 180,
                  cursor: b.linkUrl ? "pointer" : "default"
                }}
                onClick={() => b.linkUrl && navigate(b.linkUrl)}
              >
                <img
                  src={b.imageUrl}
                  alt="mid-banner"
                  style={{
                    width: "100%",
                    height: "380px",
                    objectFit: "cover",
                  }}
                />

                {/* 메인 문구 */}
                {b.mainText && (
                  <Typography
                    sx={{
                      position: "absolute",
                      top: "40%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "#fff",
                      fontSize: "20px",
                      fontWeight: 700,
                      textShadow: "0 3px 10px rgba(0,0,0,0.6)",
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
                      top: "70%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 400,
                      textShadow: "0 2px 8px rgba(0,0,0,0.5)",
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
        </Box>
      )}

      {/* 신상품 */}
      <Container sx={{ mt: 10 }}>
        <Typography variant="h5" sx={{ mb: 3, ml: 4, fontWeight: 500 }}>
          신상품
        </Typography>

        <Box sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "25px",
          justifyContent: "flex-start",
          maxWidth: "1100px",
          mx: "auto"
        }}>
          {newList.length > 0 ? (
            newList.map((item) => (
              <Paper
                key={item.numBrd}
                onClick={() => navigate(`/detail/${item.numBrd}`)}
                sx={{
                  width: "250px", height: "315px",
                  borderRadius: "12px",
                  border: "1px solid #ececec",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "0.2s",
                  "&:hover": { transform: "scale(1.03)", borderColor: "#ffb088" }
                }}
              >
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt={item.subject}
                    style={{
                      width: "100%", height: "230px",
                      objectFit: "cover", display: "block"
                    }}
                  />
                )}

                <Typography sx={{ mt: 2, fontSize: "18px", ml: 2 }}>
                  <span style={{ fontWeight: 700, color: "#d32f2f" }}>
                    {item.price?.toLocaleString()}
                  </span>
                  <span style={{ fontWeight: 500, color: "#d32f2f" }}>원</span>
                </Typography>

                <Typography sx={{
                  fontSize: "14px",
                  ml: 2, mt: 0.5,
                  maxWidth: "90%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {item.subject}
                </Typography>

              </Paper>
            ))
          ) : (
            <Typography>상품 로딩 중...</Typography>
          )}
        </Box>
      </Container>
    </Box>
  )
}
