import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  InputAdornment,
  Autocomplete,
  IconButton,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import dayjs from "dayjs";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { NavLink, useLocation } from "react-router-dom";

import MandarinOrange from "../../../assets/items/MandarinOrange.png";
import radish from "../../../assets/items/radish.png";
import banana from "../../../assets/items/banana.png";
import napaCabbage from "../../../assets/items/napaCabbage.png";
import lettuce from "../../../assets/items/lettuce.png";
import pineapple from "../../../assets/items/pineapple.png";
import greenPepper from "../../../assets/items/greenPepper.png";
import springOnion from "../../../assets/items/springOnion.png";
import defaultImage from "../../../assets/items/defaultImage.png";
import cucumberImg from '../../../assets/items/cucumber.png';
import peanut from '../../../assets/items/peanut.png';
import perillaSeeds from '../../../assets/items/perillaSeeds.png';
import perillaleaf from '../../../assets/items/perillaleaf.png';
import cherryTomato from '../../../assets/items/cherryTomato.png';
import sesame from '../../../assets/items/sesame.png';
import grapes from '../../../assets/items/grapes.png';
import potatoes from '../../../assets/items/potatoes.png';
import pepperPowder from '../../../assets/items/pepperPowder.png';
import peeledGarlic from '../../../assets/items/peeledGarlic.png';
import greenGram from '../../../assets/items/greenGram.png';
import oysterMushroom from '../../../assets/items/oysterMushroom.png';
import carrot from '../../../assets/items/carrot.png';
import buckwheat from '../../../assets/items/buckwheat.png';
import pear from '../../../assets/items/pear.png';
import ginger from '../../../assets/items/ginger.png';
import rice from '../../../assets/items/rice.png';
import glutinousRice from '../../../assets/items/glutinousRice.png';
import redBean from '../../../assets/items/redBean.png';
import bean from '../../../assets/items/bean.png';
import pumpkin from '../../../assets/items/pumpkin.png';
import kiwifruit from '../../../assets/items/kiwifruit.png'
import pumpkinJoke from '../../../assets/items/pumpkinJoke.png';
import greenbellpepper from '../../../assets/items/greenbellpepper.png';
import bloodgarlic from '../../../assets/items/bloodgarlic.png';
import shinemuscat from '../../../assets/items/shinemuscat.png';
import enokimushroom from '../../../assets/items/enokimushroom.png';
import paprika from '../../../assets/items/paprika.png';
import scallion from '../../../assets/items/scallion.png';
import cheongYang from '../../../assets/items/CheongyangChiliPepper.png';
import pepper2 from '../../../assets/items/pepper2.png';
import tomato from '../../../assets/items/tomato.png';
import dadagiCucumber from '../../../assets/items/dadagiCucumber.png';
import pricklyCucumber from '../../../assets/items/pricklyCucumber.png';
import orange from '../../../assets/items/orange.png';
import youngRadish from '../../../assets/items/youngRadish.png';
import onion from '../../../assets/items/onion.png';
import cabage from '../../../assets/items/cabage.png';
import spinach from '../../../assets/items/spinach.png';
import watermelon from '../../../assets/items/watermelon.png';
import pinemushroom from '../../../assets/items/pinemushroom.png';
import apple from '../../../assets/items/apple.png';
import broccoli from '../../../assets/items/broccoli.png';
import waterCelery from '../../../assets/items/waterCelery.png';
import melon from '../../../assets/items/melon.png';
import mango from '../../../assets/items/mango.png';
import lemon from '../../../assets/items/lemon.png';
import sweetpersimmon from '../../../assets/items/sweetpersimmon.png';
import sweetpotato from '../../../assets/items/sweetpotato.png';
import drypepper from '../../../assets/items/drypepper.png';


import EasyGraphesAndTables from "./EasyGraphesAndTables";
const CLS_CODE = "02";

// 이미지 매핑
const itemImages = {
  "고구마/밤":sweetpotato,
  "건고추/화건":drypepper,
  "깻잎/깻잎":perillaleaf,
  "느타리버섯/느타리버섯": oysterMushroom,
  "느타리버섯/애느타리버섯": oysterMushroom,
  "단감/단감": sweetpersimmon,
  "망고/수입": mango,
  "레몬/수입": lemon,
  "미나리/미나리": waterCelery,
  "멜론/멜론": melon,
  "브로콜리/브로콜리(국산)": broccoli,
  "사과/후지": apple,
  "새송이버섯/새송이버섯": pinemushroom,
  "수박/수박": watermelon,
  "시금치/시금치": spinach,
  "양파/양파": onion,
  "열무/열무": youngRadish,
  "오렌지/네이블 호주": orange,
  "오이/가시계통": pricklyCucumber,
  "오이/다다기계통": dadagiCucumber,
  "오이/취청": cucumberImg,
  "감귤/노지": MandarinOrange,
  "들깨/국산": perillaSeeds,
  "들깨/수입": perillaSeeds,
  "땅콩/국산": peanut,
  "무/가을": radish,
  "바나나/수입": banana,
  '방울토마토/대추방울토마토': cherryTomato,
  "배추/가을": napaCabbage,
  "알배기배추/알배기배추":  napaCabbage,
  "얼갈이배추/얼갈이배추":  napaCabbage,
  "양배추/양배추": cabage,
  "상추/적": lettuce,
  "상추/청": lettuce,
  "참깨/백색(국산)": sesame,
  "참깨/중국": sesame,
  "참깨/인도": sesame,
  "참다래/그린 뉴질랜드": kiwifruit,
  "파/대파": springOnion,
  "파/쪽파": scallion,
  "파인애플/수입": pineapple,
  "풋고추/꽈리고추": pepper2,
  "풋고추/오이맛고추": greenPepper,
  "풋고추/청양고추": cheongYang,
  "풋고추/풋고추(녹광 등)": greenPepper,
  "호박/애호박": pumpkinJoke,
  "호박/쥬키니": pumpkinJoke,  
  "포도/샤인머스켓": shinemuscat,
  "붉은고추/붉은고추": cheongYang,
  "감자/수미(노지)" : potatoes,
  "깐마늘(국산)/깐마늘(남도)" : peeledGarlic,
  "깐마늘(국산)/깐마늘(대서)" : peeledGarlic,
  "피마늘/난지(대서)": bloodgarlic,
  "피마늘/한지": bloodgarlic,
  "녹두/국산" : greenGram,
  "녹두/수입" : greenGram,
  "당근/무세척" : carrot,
  "당근/세척(수입)" : carrot,
  "메밀/메밀(수입)" : buckwheat,
  "배/신고" : pear,
  "생강/국산" : ginger,
  "생강/수입" : ginger,
  "쌀/20kg" : rice,  
  "찹쌀/일반계" : glutinousRice,
  "팥/붉은 팥(국산)" : redBean,
  "팥/붉은 팥(수입)" : redBean,
  "콩/흰 콩(국산)" : bean,
  "콩/흰 콩(수입)" : bean,
  "토마토/토마토": tomato,
  "파프리카/파프리카": paprika,
  "팽이버섯/팽이버섯": enokimushroom,
  "피망/청": greenbellpepper,
};

// 새 API
const ONE_API = "/api/easy-price/one/kind02";
const ITEM_LIST_API =
  "/api/easy-price/items/distinct/kind02";

const today = dayjs().format("YYYY-MM-DD");
const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

export default function PriceSearchPageB2B() {
  const firstLoad = useRef(true)
  const {state} = useLocation(); //메인페이지에서 그래프클릭했을떄 쓰려고

  const savedItem = localStorage.getItem("savedItem_b2b") || "감귤/노지";
  const savedRegday = localStorage.getItem("savedRegday_b2b") || yesterday;

  const [itemName, setItemName] = useState(
    state?.itemName || savedItem
  );

  const initialRegday = state?.regday || savedRegday;
  const [regday, setRegday] = useState(initialRegday);

  const clsCode = state?.clsCode || "02"

  // 🔹 /one 응답 (여기에 productNo, itemName, unit 등 들어있음)
  const [selected, setSelected] = useState(null);

  const [itemOptions, setItemOptions] = useState([]);

  const [dailyData, setDailyData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [yearData, setYearData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState("daily");

  const [dailyCalc, setDailyCalc] = useState({ d0: null, d30: null });
  const [yearAvg, setYearAvg] = useState(null);

  // 날짜 보정
  const fixDate = (date, direction) => {
    let d = dayjs(date);
    if (d.isAfter(dayjs(), "day")) d = dayjs().subtract(1, "day");

    if (d.day() === 0) {
      if (direction === "prev") d = d.subtract(1, "day");
      else if (direction === "next") d = d.add(1, "day");
    }

    return d.format("YYYY-MM-DD");
  };

  useEffect(() => {
  if (state?.itemName) setItemName(state.itemName);
  if (state?.regday) setRegday(state.regday);
  }, [state]);

  // 품목 리스트 불러오기
  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await fetch(ITEM_LIST_API);
        const list = await res.json();
        setItemOptions(list.sort((a, b) => a.localeCompare(b, "ko-KR")));
      } catch (err) {
        console.error(err);
      }
    };
    loadItems();
  }, []);

  // selected 불러오기(API: /one)
  const loadSelected = async (name) => {
    try {
      setLoading(true);
      setError("");

      // 🔹 itemName + regday 로 도매(02) 기준 한 건 조회 → productNo 포함된 DTO
      const query = new URLSearchParams({
        itemName: name,
        regday,
      }).toString();

      const res = await fetch(`${ONE_API}?${query}`);
      if (!res.ok) throw new Error("기준 가격 조회 실패");

      const data = await res.json();
      setSelected(data);
    } catch (err) {
      console.error("selected 로딩 실패:", err);
      setError("해당 품목의 기준 가격 정보가 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  // item 변경 시 selected 다시 로딩
  useEffect(() => {
    if (itemName) {
      localStorage.setItem("savedItem_b2b", itemName);
      loadSelected(itemName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemName, regday]); // 날짜가 바뀌어도 기준 row 다시 불러오도록


  // 날짜 변경 시 저장 — 최초 state 반영 이후에만 저장하도록 보호
  useEffect(()=> {
    if(firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    localStorage.setItem("savedRegday_b2b",regday);
  },[regday]);
    
  const formatNumber = (v) =>
    !v && v !== 0 ? "-" : Number(v).toLocaleString("ko-KR");

  const imageSrc = itemImages[itemName] || defaultImage;

  return (
    <>
      <div>
        {/* HEADER */}
        <Box
          sx={{
            width: "90%",
            margin: "0 auto",
            bgcolor: "#fafafa",
            borderBottom: "1px solid #eee",
            py: 5,
            px: 2,
            mb: 3,
          }}
        >
          <Box sx={{ maxWidth: 700, mx: "auto", textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 2, color: "#333" }}
            >
              간편 가격 정보
            </Typography>

            {/* 탭 */}
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4 }}
            >
              <NavLink
                to="/data/search/b2b"
                style={({ isActive }) => ({
                  padding: "8px 20px",
                  borderRadius: 20,
                  background: isActive ? "#367588" : "#B1B6B7",
                  color: isActive ? "#fff" : "#367588",
                  textDecoration: "none",
                  fontWeight: 600,
                })}
              >
                도매
              </NavLink>

              <NavLink
                to="/data/search/b2c"
                style={({ isActive }) => ({
                  padding: "8px 20px",
                  borderRadius: 20,
                  background: isActive ? "#367588" : "#B1B6B7",
                  color: isActive ? "#fff" : "#367588",
                  textDecoration: "none",
                  fontWeight: 600,
                })}
              >
                소매
              </NavLink>
            </Box>

            {/* 검색 바 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#fff",
                borderRadius: 50,
                px: 3,
                py: 1,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                mb: 3,
                maxWidth: 350,
                mx: "auto",
              }}
            >
              <Autocomplete
                options={itemOptions}
                value={itemName}
                onChange={(e, v) => {
                  if (v) setItemName(v);
                }}
                sx={{ flex: 1 }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="품목명" variant="standard" />
                )}
              />
              <InputAdornment position="end">
                <SearchIcon color="action" />
              </InputAdornment>
            </Box>

            {/* 날짜 선택 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#fff",
                borderRadius: 50,
                px: 3,
                py: 1,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                maxWidth: 350,
                mx: "auto",
              }}
            >
              <IconButton
                onClick={() => {
                  const newDate = fixDate(
                    dayjs(regday).subtract(1, "day"),
                    "prev"
                  );
                  setRegday(newDate);
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={dayjs(regday)}
                  format="YYYY-MM-DD"
                  onChange={(v) => {
                    if (!v) return;
                    const adjusted = fixDate(v.format("YYYY-MM-DD"));
                    setRegday(adjusted);
                  }}
                  shouldDisableDate={(date) =>
                    date.day() === 0 || date.isAfter(dayjs(), "day")
                  }
                  slotProps={{
                    textField: {
                      variant: "standard",
                      InputProps: {
                        disableUnderline: true,
                        sx: { fontSize: 18, pr: 6, pl: 6 },
                      },
                    },
                  }}
                />
              </LocalizationProvider>

              {!dayjs(regday).isSame(today, "day") && (
                <IconButton
                  onClick={() => {
                    const newDate = fixDate(
                      dayjs(regday).add(1, "day"),
                      "next"
                    );
                    setRegday(newDate);
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>

        {/* ERROR */}
        {error && (
          <Typography color="error" textAlign="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* 카드 영역 */}
        {selected && (
          <Card
            sx={{
              mb: 3,
              bgcolor: "#ddd",
              color: "#333",
              borderRadius: 3,
              p: 4,
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 2 }}>
                <Box
                  sx={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    bgcolor: "#fff",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={imageSrc}
                    alt={itemName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>

                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="h5" fontWeight={700}>
                    {selected.itemName} {selected.unit}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 40,
                      fontWeight: 900,
                      color: "#2142AB",
                      mt: 1,
                    }}
                  >
                    {formatNumber(dailyCalc.d0)}원
                  </Typography>
                </Box>
              </Box>

              {/* 전년/전월 */}
              <Box
                sx={{
                  border: 1,
                  mt: 3,
                  bgcolor: "#fff",
                  color: "#333",
                  p: 2,
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-around",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                {/* 전월 */}
                {(() => {
                  const now = dailyCalc.d0;
                  const prev = dailyCalc.d30;

                  const nowNum = Number(now);
                  const prevNum = Number(prev);

                  if (isNaN(nowNum) || isNaN(prevNum) || prevNum === 0)
                    return <Typography>전월동기: 데이터 없음</Typography>;

                  const diff = nowNum - prevNum;
                  const percent = ((diff / prevNum) * 100).toFixed(1);
                  const color =
                    diff > 0 ? "red" : diff < 0 ? "blue" : "black";
                  const arrow = diff > 0 ? "▲" : diff < 0 ? "▼" : "■";

                  return (
                    <Typography>
                      전월동기: <b>{formatNumber(prevNum)}원</b>{" "}
                      <span style={{ color, fontWeight: 700 }}>
                        ({diff > 0 ? "+" : ""}
                        {formatNumber(diff)}원 {arrow}
                        {percent}%)
                      </span>
                    </Typography>
                  );
                })()}

                {/* 전년 */}
                {(() => {
                  const now = dailyCalc.d0;
                  const prev = yearAvg;

                  const nowNum = Number(now);
                  const prevNum = Number(prev);

                  if (isNaN(nowNum) || isNaN(prevNum) || prevNum === 0)
                    return <Typography>전년동기: 데이터 없음</Typography>;

                  const diff = nowNum - prevNum;
                  const percent = ((diff / prevNum) * 100).toFixed(1);
                  const color =
                    diff > 0 ? "red" : diff < 0 ? "blue" : "black";
                  const arrow = diff > 0 ? "▲" : diff < 0 ? "▼" : "■";

                  return (
                    <Typography>
                      전년동기: <b>{formatNumber(prevNum)}원</b>{" "}
                      <span style={{ color, fontWeight: 700 }}>
                        ({diff > 0 ? "+" : ""}
                        {formatNumber(diff)}원 {arrow}
                        {percent}%)
                      </span>
                    </Typography>
                  );
                })()}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* 그래프 + 표 영역 */}

      <EasyGraphesAndTables
        itemName={itemName}
        regday={regday}
        clsCode={CLS_CODE}                // 🔹 도매: "02"
        dailyData={dailyData}
        monthData={monthData}
        yearData={yearData}
        setDailyData={setDailyData}
        setMonthData={setMonthData}
        setYearData={setYearData}
        onDailyCalculated={setDailyCalc}
        onYearAvg={setYearAvg}
        productClsName="도매"
      />
      </div>
    </>
  );
}
