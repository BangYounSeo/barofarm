import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Stack,
} from "@mui/material";

export default function PricePredict() {
  const [categoryCode, setCategoryCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [kindName, setKindName] = useState("");
  const [rank, setRank] = useState("");
  const [regionName, setRegionName] = useState("전체");
  const [productClsCode, setProductClsCode] = useState("");

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [kindOptions, setKindOptions] = useState([]);
  const [rankOptions, setRankOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);

  const [realData, setRealData] = useState([]);
  const [model, setModel] = useState("RandomForest");
  const [prediction, setPrediction] = useState(null);
  const [pastPrices, setPastPrices] = useState([]);

  // 카테고리 코드를 표시명으로 매핑
  const categoryNameMap = {
    "100": "식량작물",
    "200": "채소류",
    "300": "특용작물",
    "400": "과일류"
  };

  // 옵션 불러오기
  useEffect(() => {
    axios.get("/api/detail/categories").then(res => setCategoryOptions(res.data));
  }, []);

  // 카테고리 변경 시
  useEffect(() => {
    setItemName("");
    setKindName("");
    setRank("");
    setRegionName("전체");
    if (categoryCode) {
      axios.get(`/api/detail/items?categoryCode=${categoryCode}&productClsCode=${productClsCode}`)
        .then(res => setItemOptions(res.data));
    } else {
      setItemOptions([]);
    }
  }, [categoryCode, productClsCode]);

  // 아이템 변경 시
  useEffect(() => {
    setKindName("");
    setRank("");
    setRegionName("전체");
    if (categoryCode && itemName) {
      axios.get(`/api/detail/kinds?categoryCode=${categoryCode}&itemName=${itemName}&productClsCode=${productClsCode}`)
        .then(res => setKindOptions(res.data));
    } else setKindOptions([]);
  }, [categoryCode, itemName, productClsCode]);

  // 종류 변경 시
  useEffect(() => {
    setRank("");
    setRegionName("전체");
    if (categoryCode && itemName && kindName) {
      axios.get(`/api/detail/ranks?categoryCode=${categoryCode}&itemName=${itemName}&kindName=${kindName}&productClsCode=${productClsCode}`)
        .then(res => setRankOptions(res.data));
    } else setRankOptions([]);
  }, [categoryCode, itemName, kindName, productClsCode]);

  // 등급 변경 시
  useEffect(() => {
    setRegionName("전체");
    if (categoryCode && itemName && kindName && rank) {
      axios.get(`/api/detail/regions?categoryCode=${categoryCode}&itemName=${itemName}&kindName=${kindName}&rank=${rank}&productClsCode=${productClsCode}`)
        .then(res => {
          const regions = ["전체", ...res.data.filter(r => r !== "전체")];
          setRegionOptions(regions);
        });
    } else {
      setRegionOptions(["전체"]);
    }
  }, [categoryCode, itemName, kindName, rank, productClsCode]);

  // 실제 데이터 불러오기
  useEffect(() => {
    if (categoryCode && itemName && kindName && rank && regionName) {
      axios.get(`/api/detail/search?categoryCode=${categoryCode}&itemName=${itemName}&kindName=${kindName}&rank=${rank}&productClsCode=${productClsCode}&regionName=${regionName}`)
        .then(res => setRealData(res.data));
    } else setRealData([]);
  }, [prediction]);

  // 예측
  const handlePredict = async () => {
    const features = { categoryCode, itemName, kindName, productClsCode, rank, regionName,model };
    try {
      const res = await axios.post("http://192.168.0.18:5000/predict", features);
      setPrediction(res.data.predicted_price);
      setPastPrices(res.data.past_prices);
    } catch (error) {
      console.error("Predict error:", error.response?.data || error.message);
      alert("예측 중 오류가 발생했습니다.");
      setPrediction(null);
    }
  };

  return (
    <>
      <Box sx={{ maxWidth: 500, mx: "auto", mt: 5, p: 3, border: "1px solid #ddd", borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="h5" gutterBottom>AI 가격 예측</Typography>
        <Stack spacing={2}>
          {/* 상품 구분 */}
          <FormControl fullWidth>
            <InputLabel>상품 구분</InputLabel>
            <Select value={productClsCode} onChange={e => setProductClsCode(e.target.value)}>
              <MenuItem value="">선택</MenuItem>
              <MenuItem value="01">소매</MenuItem>
              <MenuItem value="02">도매</MenuItem>
            </Select>
          </FormControl>

          {/* 카테고리 */}
          <FormControl fullWidth>
            <InputLabel>카테고리</InputLabel>
            <Select value={categoryCode} onChange={e => setCategoryCode(e.target.value)}>
              <MenuItem value="">선택</MenuItem>
              {categoryOptions.map(c => (
                <MenuItem key={c} value={c}>
                  {categoryNameMap[c] || c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 아이템 */}
          <FormControl fullWidth>
            <InputLabel>아이템</InputLabel>
            <Select value={itemName} onChange={e => setItemName(e.target.value)}>
              <MenuItem value="">선택</MenuItem>
              {itemOptions.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
            </Select>
          </FormControl>

          {/* 종류 */}
          <FormControl fullWidth>
            <InputLabel>종류</InputLabel>
            <Select value={kindName} onChange={e => setKindName(e.target.value)}>
              <MenuItem value="">선택</MenuItem>
              {kindOptions.map(k => <MenuItem key={k} value={k}>{k}</MenuItem>)}
            </Select>
          </FormControl>

          {/* 등급 */}
          <FormControl fullWidth>
            <InputLabel>등급</InputLabel>
            <Select value={rank} onChange={e => setRank(e.target.value)}>
              <MenuItem value="">선택</MenuItem>
              {rankOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>

          {/* 지역 */}
          <FormControl fullWidth>
            <InputLabel>지역</InputLabel>
            <Select value={regionName} onChange={e => setRegionName(e.target.value)}>
              {regionOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>

          {/* 모델 */}
          <FormControl fullWidth>
            <InputLabel>모델</InputLabel>
            <Select value={model} onChange={e => setModel(e.target.value)}>
              <MenuItem value="RandomForest">RandomForest</MenuItem>
              <MenuItem value="LinearRegression">LinearRegression</MenuItem>
              <MenuItem value="XGBoost">XGBoost</MenuItem>
              <MenuItem value="LightGBM">LightGBM</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" onClick={handlePredict}>예측</Button>

          {/* 예측, 실제 가격, 차이 표시 */}
          {prediction !== null && realData && (
            (() => {
              const validItem = realData.find(item => item.dpr1 !== "-" && item.dpr1 !== undefined);

    if (!validItem) return null; // 유효값 없으면 렌더링 X

    const actual = Number(validItem.dpr1);
              const diff = Math.round(prediction - actual);
              const rate = ((prediction - actual) / actual * 100).toFixed(2);
              const isUp = diff > 0;
              return (
                <Box sx={{ mt: 2, textAlign: "center", fontSize: 18 }}>
                <Typography variant="h6">
                  예측 가격: {Math.round(prediction)}원{" "}
                  <span style={{ color: isUp ? "red" : diff < 0 ? "blue" : "black", fontWeight: "bold" }}>
                    {isUp ? "▲" : diff < 0 ? "▼" : "▶"} {Math.abs(diff)}원 ({Math.abs(rate)}%)
                  </span>
                </Typography>
                <br/>
                <Typography variant="h6">최근 가격: {Math.round(actual)}원</Typography>
              </Box>
              );
            })()
          )}
        </Stack>
      </Box>

      {/* 모델별 성능 비교 */}
      <Box
        sx={{
          fontSize: 16,
          textAlign: "center",
          backgroundColor: "#cecdcdff",
          p: 3,
          mt: 3,
          borderRadius: 2,
          width: { sm: "40%", xs: "85%" },
          mx: "auto",
        }}
      >
        모델별 성능 비교
        <Box
          sx={{
            mt: 3,
            opacity: 0.6,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 1,
            textAlign: "center",
            fontFamily: "monospace",
          }}
        >
          <Box fontWeight="bold">Model</Box>
          <Box fontWeight="bold">RMSE</Box>
          <Box fontWeight="bold">MAE</Box>
          <Box fontWeight="bold">R2</Box>
          <Box fontWeight="bold">MedianAE</Box>

          <Box>RandomForest</Box>
          <Box>1721.73</Box>
          <Box>1161.65</Box>
          <Box>0.9997</Box>
          <Box>952.45</Box>

          <Box>XGBoost</Box>
          <Box>1562.12</Box>
          <Box>560.91</Box>
          <Box>0.9997</Box>
          <Box>117.91</Box>

          <Box>LightGBM</Box>
          <Box>13618.00</Box>
          <Box>2473.48</Box>
          <Box>0.9783</Box>
          <Box>342.50</Box>

          <Box>LinearRegression</Box>
          <Box>975.11</Box>
          <Box>348.09</Box>
          <Box>0.9999</Box>
          <Box>75.05</Box>
        </Box>
      </Box>
    </>
  );
}
