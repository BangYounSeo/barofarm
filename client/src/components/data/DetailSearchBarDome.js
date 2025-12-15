import React, { useState, useEffect } from 'react';
import { Container, Typography, Autocomplete, TextField, Select, MenuItem, Button, Box, Paper } from "@mui/material";
import axios from "axios";
import { Navigate, useNavigate } from 'react-router-dom';

const categoryMap = {
  100:'식량작물',200:'채소류',300:'특용작물',400:'과일류'
}


const DetailSearchBar = ({ onSearch }) => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("100");
  const [productClsCode,setProductClsCode ] = useState("02");
  const [selectedRegion, setSelectedRegion] = useState("전체");   
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("쌀");
  const [kinds, setKinds] = useState([]);
  const [selectedKind, setSelectedKind] = useState("20kg(20kg)");
  const [initialized, setInitialized] = useState(false);
  const [regions, setRegions] = useState([]);
  

  useEffect(() => {
    if (!category) return;
    axios.get(`/api/detail/items?categoryCode=${category}&productClsCode=${productClsCode}`)
      .then(res => setItems(res.data))
      .catch(err => console.error(err));

    if (initialized) {
      setSelectedItem(null);
      setSelectedKind(null);
      setSelectedRegion("전체");
    } else {
      setInitialized(true);
    }
  }, [category]);

  useEffect(() => {
    if(initialized){
      setSelectedKind([]);
      setSelectedRegion("전체");
    }
    
    axios.get(`/api/detail/kinds?categoryCode=${category}&itemName=${selectedItem}&productClsCode=${productClsCode}`)
      .then(res => setKinds(res.data))
      .catch(err => console.error(err));
  }, [selectedItem, category]);

useEffect(() => {
 if(initialized){
      setSelectedRegion("전체");
    }

  axios.get(`/api/detail/regions`, {
    params: {
      categoryCode: category,
      itemName: selectedItem,
      kindName: selectedKind,
      productClsCode: productClsCode
    }
  })
    .then(res => {
      const regionList = res.data || [];

    // "전체"를 맨 위로 오도록 정렬
    const orderedRegions = ["전체", ...regionList.filter(r => r !== "전체")];
      setRegions(orderedRegions)
    })
      
    .catch(err => console.error(err));
}, [category, selectedItem, selectedKind]);

  // 마운트 시 1회 검색
  useEffect(() => {
    onSearch({
      categoryCode: category,
      itemName: selectedItem,
      kindName: selectedKind,
      regionName: selectedRegion,
      productClsCode: productClsCode
    });
    
  }, []);

  const handleSearch = () => {
    onSearch({
      categoryCode: category,
      itemName: selectedItem,
      kindName: selectedKind,
      regionName: selectedRegion,
      productClsCode: productClsCode
    });
  };
  const handleNavigateSearch = (path) => {
    navigate(path);
  };

  return (
    <Container sx={{width:'100%'}} >

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mt: 2 ,display: "flex",
            flexWrap: "wrap",
            gap: 3,position: "relative"
             }}>
                <Box
                        sx={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          display: "flex",
                          gap: 1
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleNavigateSearch("/data/detail")}
                        >
                          소매
                        </Button>
                        <Button
                        variant="contained"
                          size="small"
                        >
                          도매
                        </Button>
                      </Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          검색 조건
        </Typography>

        <Box
        sx={{display: "flex",
            flexWrap: "wrap",
            gap: 3,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",}}
        >

          {/* 카테고리 */}
          <Box sx={{ minWidth: 200 }}>
            <Typography sx={{ mb: 1, fontSize: 14 }}>카테고리</Typography>
            <Select
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              {Object.entries(categoryMap).map(([code, name]) => (
                <MenuItem key={code} value={code}>{name}</MenuItem>
              ))}
            </Select>
          </Box>

          {/* 품목 */}
          <Box sx={{ minWidth: 220,pt:3}}>
            <Autocomplete
              options={items}
              value={selectedItem}
              onChange={(e, newValue) => setSelectedItem(newValue)}
              renderInput={(params) => <TextField {...params} size="small" label="품목명" />}
            />
          </Box>

          {/* 품종 */}
          <Box sx={{ minWidth: 220 ,pt:3}}>
            <Autocomplete
              options={kinds}
              value={selectedKind}
              onChange={(e, newValue) => setSelectedKind(newValue)}
              renderInput={(params) => <TextField {...params} size="small" label="품종명" />}
            />
          </Box>
<Box sx={{ minWidth: 220 ,pt:3}}>
          {/* 지역 */}
          <Autocomplete
            options={regions}
            value={selectedRegion}
            onChange={(e, newValue) => setSelectedRegion(newValue)}
            renderInput={(params) => <TextField {...params} size="small" label="지역 선택" />}
          />
</Box>
          {/* 검색버튼 */}
          <Box sx={{ alignSelf: "end",pb:1.5 }}>
            <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!selectedItem || typeof selectedItem !== "string" ||
            !selectedKind || typeof selectedKind !== "string" ||
             !selectedRegion || typeof selectedRegion !== "string"}   // ← 추가
            sx={{
              height: 40,
              px: 4,
              borderRadius: 2,
              fontWeight: 600
            }}
          >
            검색
          </Button>
          </Box>
        </Box>

      </Paper>
    </Container>
  );
};

export default DetailSearchBar;
