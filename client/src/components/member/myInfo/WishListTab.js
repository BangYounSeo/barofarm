// src/components/member/WishListTab.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useOutletContext, useNavigate } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { deleteAllWish, deleteOneWish, getmyWish } from "../../../service/MemberService";

const WishListTab = () => {
  const { myInfo, COLORS, SHADOWS } = useOutletContext();
  const navigate = useNavigate();

  const [wishes,setWishes] = useState([])

  useEffect(() => {
    (async() => {
      const res = await getmyWish()

      setWishes(res)
    })()
  },[])

  const [open,setOpen] = useState(false);

  const deleteAll = async() => {

      if(!wishes || wishes.length===0) return alert("삭제할 목록이 없습니다");
      await deleteAllWish()
      setOpen(false);
      setWishes([])
  }

  const deleteOne = async(goodId) => {
    await deleteOneWish(goodId);
    setWishes(prev =>
      prev.filter(g => g.goodId !== goodId)
    )
  }
  return (
    <Box>
      <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>
        위시 리스트 
        <span style={{fontSize:12, color:'#999999',marginLeft:'5px',cursor:'pointer'}} onClick={() => setOpen(true)}>전체삭제</span>
      </Typography>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>전체삭제</DialogTitle>
        <DialogContent>좋아요 목록을 전부 삭제하시겠습니까?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button onClick={deleteAll} color="error">삭제</Button>
        </DialogActions>
      </Dialog>

      {wishes.length === 0 ? (
        <Paper
          sx={{
            py: 5,
            px: 3,
            textAlign: "center",
            borderRadius: "16px",
            border: `1px solid ${COLORS.border}`,
            boxShadow: SHADOWS.soft,
            color: COLORS.textSub,
            fontSize: 14,
          }}
        >
          찜한 상품이 없습니다.
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {wishes.map((w) => (
            <Paper
              key={w.goodId}
              sx={{
                p: 2,
                borderRadius: "14px",
                border: `1px solid ${COLORS.border}`,
                boxShadow: SHADOWS.soft,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                {/* 썸네일 */}
                {w.board.thumbnail && (
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "12px",
                    overflow: "hidden",
                    bgcolor: "#f3f3f3",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    navigate(`/detail/${parseInt(w.targetId, 10)}`)
                  }
                >
                  
                    <img
                      src={w.board.thumbnail}
                      alt={w.subject}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  
                </Box>
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.textMain,
                      mb: 0.3,
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      navigate(`/detail/${parseInt(w.targetId, 10)}`)
                    }
                  >
                    {w.board.subject}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.textMain,
                      mb: 0.3,
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      navigate(`/detail/${parseInt(w.targetId, 10)}`)
                    }
                  >
                    {w.board.price}원
                  </Typography>
                  {/* 필요하면 나중에 농가명/판매자명 추가 가능 */}
                </Box>

                <Stack spacing={0.5} alignItems="flex-end">
                  <IconButton size="small">
                    <FavoriteIcon
                      onClick={() => deleteOne(w.goodId)}
                      sx={{ fontSize: 30, color: "#ff6b6b" }}
                    />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default WishListTab;
