import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box, Typography, IconButton, Stack, TextField, InputAdornment,
  Drawer, List, ListItemText,
  ListItemButton
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import Badge from "@mui/material/Badge";
import { getCartList } from "../../service/CartService";
import { useLocation, useNavigate } from "react-router-dom";
import { searchSales } from "../../service/SalesList"
import { MemberContext } from "../member/login/MemberContext";

export default function Header({ footer }) {

  const navigate = useNavigate()
  const [showSearch, setShowSearch] = useState(true) //검색창 보이기 여부
  const [openMenu, setOpenMenu] = useState(false) //모바일 메뉴상태
  const [searchText, setSearchText] = useState("") //검색어 입력값 상태 추가
  const { pathname } = useLocation()
  const hidePaths = ['/member', '/sales/write', '/sales/edit', '/producer', '/user', '/data']
  const hideSearch = hidePaths.some(path => pathname.startsWith(path))
  const { cartCount, setCartCount } = useContext(MemberContext) //장바구니 수량

  const lastScrollRef = useRef(0)
  const { loggedIn, logout, role } = useContext(MemberContext)


  //장바구니 수량 불러오기
  useEffect(() => {
    const fetchCartCount = async () => {
      const userId = localStorage.getItem("userId")
      if (!userId) return // 로그인 안 했으면 실행 안 함

      try {
        const res = await getCartList(userId)
        setCartCount(res.data.length) // 장바구니 담긴 개수
      } catch (e) {
        console.error("장바구니 개수 로딩 오류:", e)
      }
    }
    fetchCartCount()
  }, [loggedIn])

  useEffect(() => {
    if (hideSearch) {
      setShowSearch(false)
      return
    }
    const handleScroll = () => {
      const currentScroll = window.scrollY
      //스크롤 내릴 때 검색창 숨김
      if (currentScroll > lastScrollRef.current && currentScroll > 50) {
        setShowSearch(false)
      } else {
        setShowSearch(true)
      }
      lastScrollRef.current = currentScroll
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [pathname])

  //검색
  const boardSearch = async () => {
    const keyword = searchText.trim()

    //검색어가 비어있으면 전체 목록 페이지로만 이동
    if (keyword === "") {
      navigate("/salesboard")
      return
    }

    try {
      //검색 결과를 리스트 페이지로 전달
      navigate("/salesboard", { state: {keyword} })
    } catch (err) {
      console.error("검색 오류:", err)
    }
  }

  //엔터키 입력 처리
  const enterKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      boardSearch()
    }
  }

  return (
    <Box sx={{
      width: "100%", background: "#fff",
      borderBottom: "1px solid #eaeaea", p: "18px 5px",
      position: "fixed", top: 0, left: 0, zIndex: 1000
    }}>

      {/* 상단: 로고 + 메뉴 + 아이콘 */}
      <Stack direction="row" alignItems="center"
        sx={{ width: "100%", mx: "auto", mb: 1.2 }}>

        {/* 왼쪽 로고 */}
        <Box sx={{
          width: { xs: "auto", md: "200px" },
          display: "flex", justifyContent: "flex-start",
          pl: 2
        }}>

          <Typography onClick={() => window.location.replace("/")}
            sx={{
              fontFamily: "'Balsamiq Sans'",
              fontSize: { xs: "28px", md: "40px" },
              cursor: "pointer"
            }}>
            barofarm
          </Typography>

        </Box>

        {/* 중앙 메뉴 */}
        <Stack direction="row" spacing={3} sx={{
          flex: 1, justifyContent: "center",
          display: { xs: "none", md: "flex" }
        }}>

          {/* 메뉴 클릭 시 navigate 적용 */}
          <Typography onClick={() => navigate("/data/maindata")}
            sx={{
              cursor: "pointer", fontSize: "17px",
              "&:hover": { color: "#FFC19E" }
            }}>
            소비(시세)정보
          </Typography>

          <Typography onClick={() => navigate("/salesboard")}
            sx={{
              cursor: "pointer", fontSize: "17px",
              "&:hover": { color: "#FFC19E" }
            }}>
            직거래마트
          </Typography>

          <Typography onClick={() => navigate("/notice")}
            sx={{
              cursor: "pointer", fontSize: "17px",
              "&:hover": { color: "#FFC19E" }
            }}>
            공지사항
          </Typography>
          {loggedIn ? (
            <>
              <Typography onClick={() => navigate("/user/mypage")}
                sx={{
                  cursor: "pointer", fontSize: "17px",
                  "&:hover": { color: "#FFC19E" }
                }}>
                내정보
              </Typography>
              {role === 'ROLE_PRODUCER' && (
                <Typography onClick={() => navigate("/producer")}
                  sx={{
                    cursor: "pointer", fontSize: "17px",
                    "&:hover": { color: "#FFC19E" }
                  }}>
                  판매자센터
                </Typography>
              )}
              {role == "ROLE_USER" && (
                <Typography
                  onClick={() => navigate("/producer/join")}
                  sx={{
                    cursor: "pointer",
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "#FF8A3D",
                    "&:hover": { color: "#FF6F00" },
                  }}
                >
                  판매자 등록
                </Typography>
              )}
                {role == "ROLE_ADMIN" && (
                <Typography
                  onClick={() => navigate("/admin")}
                  sx={{
                    cursor: "pointer",
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "#FF8A3D",
                    "&:hover": { color: "#FF6F00" },
                  }}
                >
                  관리자 페이지
                </Typography>
              )}
            </>
          ) : (
            <Typography onClick={() => navigate("/member/login")}
              sx={{
                cursor: "pointer", fontSize: "17px",
                "&:hover": { color: "#FFC19E" }
              }}>
              로그인
            </Typography>
          )
          }
        </Stack>

        <Box sx={{
          width: { xs: "100%", md: "240px" },
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "12px",
          pr: 2,
        }}>

          {/* ❤️ 찜 아이콘 */}
          <IconButton
            onClick={() =>
              loggedIn
                ? navigate("/user/mypage/wishlist")
                : navigate("/member/login")
            }
          >
            <FavoriteBorderIcon sx={{ fontSize: 29, color: "#555" }} />
          </IconButton>

          {/* 👤 마이페이지 */}
          <IconButton
            onClick={() =>
              loggedIn
                ? navigate("/user/mypage")
                : navigate("/member/login")
            }
          >
            <PersonIcon sx={{ fontSize: 29, color: "#555" }} />
          </IconButton>

          {/* 🛒 장바구니 */}


          <IconButton onClick={() => loggedIn
            ? navigate("/cart")
            : navigate("/member/login")}>
            <Badge
              badgeContent={cartCount}
              invisible={cartCount === 0} // 0이면 숨김
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "13px", height: "10px",
                  minWidth: "18px", fontWeight: 900, color: "#ffa2a2ff"
                }
              }}
            >
              <AddShoppingCartOutlinedIcon fontSize="large" sx={{ color: "#555" }} />
            </Badge>
          </IconButton>

          <IconButton onClick={() => setOpenMenu(true)}>
            <MenuIcon fontSize="large" />
          </IconButton>
        </Box>
      </Stack>

      {/* 검색창 */}
      <Box sx={{
        textAlign: "center", maxWidth: "1200px", mx: "auto",
        mt: showSearch ? "0px" : "-70px", opacity: showSearch ? 1 : 0,
        transition: "all 0.3s ease", pointerEvents: showSearch ? "auto" : "none"
      }}>

        <TextField placeholder="검색어를 입력하세요."
          variant="outlined"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={enterKey}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ mr: 1.5 }}>
                <IconButton onClick={boardSearch}>
                  <SearchIcon sx={{ color: "#FFB088" }} />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            width: { xs: "90%", sm: "70%", md: "450px" },
            "& .MuiOutlinedInput-root": {
              height: "50px", borderRadius: "25px",
              "& fieldset": { borderColor: "#FFC19E" },
              "&:hover fieldset": { borderColor: "#FFB088" },
              "&.Mui-focused fieldset": { borderColor: "#FFA56E" }
            },
            "& input": { padding: "12px 25px", fontSize: "15px" }
          }}
        />
      </Box>

      {/* Drawer (모바일 메뉴) */}
      <Drawer anchor="right" open={openMenu} onClose={() => setOpenMenu(false)}>
        <Box sx={{ width: 250, p: 2 }}>
          <List>
            {/* 모바일 메뉴에도 navigate 적용 */}
            <ListItemButton onClick={() => { navigate("/data/maindata"); setOpenMenu(false) }}>
              <ListItemText primary="소비(시세)정보" />
            </ListItemButton>

            <ListItemButton onClick={() => { navigate("/salesboard"); setOpenMenu(false) }}>
              <ListItemText primary="직거래마트" />
            </ListItemButton>

            <ListItemButton onClick={() => { navigate("/notice"); setOpenMenu(false) }}>
              <ListItemText primary="공지사항" />
            </ListItemButton>
            {loggedIn ?
              <>
                <ListItemButton onClick={() => { navigate("/user/mypage"); setOpenMenu(false) }}>
                  <ListItemText primary="내정보" />
                </ListItemButton>

                {role === "ROLE_PRODUCER" && (
                  <ListItemButton onClick={() => { navigate("/producer"); setOpenMenu(false); }}>
                    <ListItemText primary="판매자센터" />
                  </ListItemButton>
                )}

                {role === "ROLE_CONSUMER" && (
                  <ListItemButton onClick={() => { navigate("/producer/join"); setOpenMenu(false); }}>
                    <ListItemText primary="판매자 등록" />
                  </ListItemButton>
                )}
                {role === "ROLE_ADMIN" && (
                  <ListItemButton onClick={() => { navigate("/admin"); setOpenMenu(false); }}>
                    <ListItemText primary="관리자 페이지" />
                  </ListItemButton>
                )}
                <ListItemButton onClick={() => { logout(); setOpenMenu(false) }}>
                  <ListItemText primary="로그아웃" />
                </ListItemButton>
              </>
              :
              <ListItemButton onClick={() => { navigate("/member/login"); setOpenMenu(false) }}>
                <ListItemText primary="로그인" />
              </ListItemButton>
            }
          </List>
        </Box>
      </Drawer>
    </Box>
  )
}
