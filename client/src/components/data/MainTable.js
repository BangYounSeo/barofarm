import React from "react";
import {
  Box,
  Card,
  Tabs,
  Tab,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";

import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function MainTable({
  tab,
  setTab,
  currentList,
  highlightIndex,
  setHighlightIndex
}) {
  // 탭 핸들러
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setHighlightIndex(0);
  };

  return (
 
  <Card sx={{ width: "100%", p: 3, borderRadius: 4 }}>
    <Tabs
      value={tab}
      onChange={handleTabChange}
      centered
      TabIndicatorProps={{ style: { display: "none" } }}
      sx={{
        mb: 3,
        "& .MuiTab-root": {
          borderRadius: "20px",
          textTransform: "none",
          minHeight: "36px",
          px: 2.5,
          mx: 1,
          fontSize: 11,
          fontWeight: 600,
          border: "1px solid #ddd",
        },

        "& .Mui-selected": {
          backgroundColor: "#4DB6AC",
          borderColor: "#4DB6AC",
        },
        
      }}
    >    
    <Tab 
      value="type1"
      label={<Typography sx={{ fontWeight: 550, color: tab === "type1" ? "white" : "#444" }}>인기상품 순위</Typography>}
    />
    <Tab 
      value="type2"
      label={<Typography sx={{ fontWeight: 550, color: tab === "type2" ? "white" : "#444" }}>알뜰소비 순위</Typography>}
    />
    </Tabs>



      {/* =====================
          📌 리스트 영역
      ====================== */}

      <List>
        {currentList
        .map((item, idx) => {
          const isUp = item.direction === "1";
          const isDown = item.direction === "0";
          const isSame = item.direction === "2";

          return (
            <ListItemButton
              key={idx}
              onClick={() => setHighlightIndex(idx,item)}
              selected={highlightIndex === idx}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "rgba(0, 123, 255, 0.1)"
                }
              }}
            >
              {/* 순위 */}
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: "#462679",
                    width: 36,
                    height: 36,
                    fontSize: 18,
                    fontWeight: 700
                  }}
                >
                  {idx + 1}
                </Avatar>
              </ListItemAvatar>

              {/* 이름 + 가격 */}
              <ListItemText
                primaryTypographyProps={{ component: "div" }}
                secondaryTypographyProps={{ component: "div" }}
                primary={
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                      {item.productName}
                    </Typography>

                    <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                      {item.dpr1.toLocaleString()}원
                    </Typography>
                  </Stack>
                }
                secondary={
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography sx={{ color: "#999" }}>{item.unit}</Typography>

                    <Stack direction="row" alignItems="center" spacing={0.3}>
{isUp && (
  <>
    <ArrowDropUpIcon sx={{ color: "red" }} />
    <Typography sx={{ fontWeight: 600, color: "red" }}>
      7일 전 대비 {item.value}%
    </Typography>
  </>
)}

{isDown && (
  <>
    <ArrowDropDownIcon sx={{ color: "dodgerblue" }} />
    <Typography sx={{ fontWeight: 600, color: "dodgerblue" }}>
      7일 전 대비 {item.value}%
    </Typography>
  </>
)}

{isSame && (
  <Typography sx={{ fontWeight: 600, color: "#999" }}>
    지난 주와 변동 없음
  </Typography>
)}

                    </Stack>
                  </Stack>
                }
              />
            </ListItemButton>
          );
        })}
      </List>    
  </Card>
  );
}
