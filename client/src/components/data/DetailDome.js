import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, useTheme } from '@mui/material';
import axios from 'axios';
import DetailSearchBar from './DetailSearchBarDome';
import OneWeekLineChart from './OneWeekLineChart';
import TodayPriceComparisonChart from './TodayPriceComparisonChart';
import RegionBarChart from './RegionBarChart';
import YearTabsMonthlyChart from './YearTabsMonthlyChart';
import Result from './Result';


function Detail() {
  const [results, setResults] = useState([]);
  const [yearlySalesList, setYearlySalesList] = useState([]);
  const [groupedByRank, setGroupedByRank] = useState({});
  const [selectedRank, setSelectedRank] = useState(null);
  const [latestDay,setLatestDay] = useState();
  const [regionData,setRegionData] = useState([]);
  const [regionAllData,setRegionAllData] = useState([]);
  const [monthlySalesList,setMonthlySalesList] = useState([]);
  const theme = useTheme();
const color = theme.palette.primary.main;

  
  // results가 바뀌면 groupedByRank 업데이트
  useEffect(() => {
    if (results.length === 0) return;

    const grouped = results.reduce((acc, item) => {
      const rank = item.rank;
      if (!acc[rank]) acc[rank] = [];
      acc[rank].push(item);
      return acc;
    }, {});

    Object.keys(grouped).forEach(rank => {
      grouped[rank].sort((a, b) => b.regday.localeCompare(a.regday));
    });

    setGroupedByRank(grouped);

    // 기본 선택 rank를 첫 번째로
    if (!selectedRank) setSelectedRank(Object.keys(grouped)[0]);
  }, [results]);

  const fetchYearlySales = (target) => {

    axios.get("/api/detail/yearlySalesList", {
      params: {
        p_yyyy: target.regday.slice(0,4),
        p_itemcategorycode: target.categoryCode,
        p_itemcode: target.itemCode,
        p_kindcode: target.kindCode,
        p_countycode: target.regionCode
      }
    })
    .then(res => {
      const itemsByCode = res.data.filter(entry => entry.productclscode === "02");
      if (itemsByCode.length > 0) {
        setYearlySalesList(itemsByCode);
      } else {
        setYearlySalesList([]);
      }
    })
    .catch(err => console.error(err));
  };

  const fetchMonthlySales = (target) => {

    axios.get("/api/detail/monthlySalesList", {
      params: {
        p_yyyy: target.regday.slice(0,4),
        p_itemcategorycode: target.categoryCode,
        p_itemcode: target.itemCode,
        p_kindcode: target.kindCode,
        p_period: "9",
        p_countycode: target.regionCode
      }
    })
    .then(res => {
      const itemsByCode = res.data.filter(entry => entry.productclscode === "02");
      if (itemsByCode.length > 0) {
        setMonthlySalesList(itemsByCode);
      } else {
        setMonthlySalesList([]);
      }
    })
    .catch(err => console.error(err));
  };

  useEffect(() => {
    const defaultTarget = {
      regday: new Date().toISOString().slice(0, 10),
      categoryCode: "100",
      itemCode: "111",
      kindCode: "01",
      regionCode: "1101"
    };
    fetchYearlySales(defaultTarget);
    fetchMonthlySales(defaultTarget);
  }, []);

  const handleSearch = (params) => {
    axios.get("/api/detail/search", { params })
      .then(res => {
        // 🔥 regday 기준 최신순 정렬 (내림차순)
        const sorted = [...res.data].sort((a, b) => {
        return new Date(b.regday) - new Date(a.regday);});

        setResults(sorted);
        const latest  = sorted.find(item => item.dpr1 !== "-")?.regday ?? null;
        setLatestDay(latest)
            
        if (sorted.length > 0) {
          fetchYearlySales(sorted[0]);
          fetchMonthlySales(sorted[0]);
          setSelectedRank(sorted[0].rank);
        }
      })
      .catch(err => console.error(err));
  };

  const handleRankSelect = (rank) => {
    setSelectedRank(rank);
    
  };

  useEffect(() => {
    if (!results || results.length === 0) return; // undefined 체크 추가

    axios.get("/api/detail/region", {
      params: {
        categoryCode: results[0].categoryCode,
        itemCode: results[0].itemCode,
        kindCode: results[0].kindCode,
        productClsCode: results[0].productClsCode,
      }
    }).then(res => {
        const regionName = results[0].regionName;
        if (regionName === "전체") {
            setRegionData(res.data.filter(item => item.rank === selectedRank));
            setRegionAllData(res.data.filter(item => item.rank === selectedRank));
        } else {
            const filteredData = res.data.filter(item => item.regionName === regionName && item.rank===selectedRank);
            const nationwideData = res.data.filter(item => item.regionName ==="전체" && item.rank===selectedRank);
            setRegionData([...nationwideData,...filteredData]);
            
        }
    }).catch(err => {
      console.error(err);
    });
}, [results,selectedRank]);


  // 선택된 rank에 해당하는 OneWeekLineChart 데이터
 const oneWeekChart = selectedRank
  ? (groupedByRank[selectedRank] || [])
      .filter(item => item.dpr1 !== "-")
      .map(item => ({
        date: item.regday,
        price: Number(item.dpr1),
        prevDayPrice: Number(item.dpr2),
        prevWeekPrice: Number(item.dpr3),
        prevMonthPrice: Number(item.dpr5),
        prevYearPrice: Number(item.dpr6),
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // ← 최신순 정렬
  : [];
    
  const filteredRegionData = selectedRank
  ? regionData.filter(item => item.rank === selectedRank)
  : regionData;


const filteredMonthly = selectedRank
  ? monthlySalesList.find(item => item.caption.includes(selectedRank))
  : monthlySalesList[0];

const filteredMonthlySalesList = filteredMonthly?.items ?? [];

const common5Year = filteredMonthlySalesList.length > 0 ? filteredMonthlySalesList.slice(1,6) : null;

const itemName = regionData.length > 0 ? `${regionData[0].itemName} / ${regionData[0].kindName}` : null;


const todayPrice = oneWeekChart.length > 0 
  ? oneWeekChart[0].price 
  : null ;

  const prevPrice = oneWeekChart.length > 0 
  ? oneWeekChart[0].prevDayPrice 
  : null ;

    const prevWeekPrice = oneWeekChart.length > 0 
  ?  oneWeekChart[0].prevWeekPrice 
  :   null;

      const prevMonthPrice = oneWeekChart.length > 0 
  ? oneWeekChart[0].prevMonthPrice 
  : null ;

  const prevYearPrice = oneWeekChart.length > 0 
  ? oneWeekChart[0].prevYearPrice 
  : null ;

   const matched = yearlySalesList.find(item => 
  item.caption.includes(selectedRank)
);

const filteredYearAvg = matched
  ?  Number(matched.items?.[0]?.avg ?? null)
  : null ;

const commonYearAvg =
  filteredMonthlySalesList.length > 0
    ? Math.round(filteredMonthlySalesList
        .slice(1, 6)
        .reduce((sum, item) => sum + Number(item.yearAvg || 0), 0) / 5)
    : null;

      const currentRegion = regionData.length > 0 && (regionData.length === 2 ? regionData.find(item => item.regionName !== "전체").regionName : "전체")


const X = 5; // 급등/급락 기준 퍼센트

const changes = groupedByRank[selectedRank]?.
  filter(item => item.dpr1 !== "-" && item.dpr2 !== "-") // 숫자만
  .map(item => {
    const today = Number(item.dpr1);
    const prev = Number(item.dpr2);

    const change = ((today - prev) / prev) * 100;

    if (change >= X) return { date: item.regday, status: "급등" };
    if (change <= -X) return { date: item.regday, status: "급락" };
    return null;
  })
  .filter(Boolean) || []; 

const maxMinRegion = regionAllData.length > 0 ? (regionAllData.filter(item => item.dpr1 !== "-").map(item => ({
  region : item.regionName,
  price : Number(item.dpr1)
}))) : [];
// 가격 기준 최대/최소 지역 찾기
let maxRegion = null;
let minRegion = null;

if (maxMinRegion.length > 0) {
  maxRegion = maxMinRegion.reduce((prev, current) => 
    current.price > prev.price ? current : prev
  );

  minRegion = maxMinRegion.reduce((prev, current) => 
    current.price < prev.price ? current : prev
  );
}

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <DetailSearchBar onSearch={handleSearch} />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 400 }} >
                <strong>{latestDay}</strong> 기준<br/>
                <span style={{ color: color }}>{itemName}</span> | <span style={{ color: color }}>{selectedRank}</span> | <span style={{ color: color }}>{currentRegion}</span> 
              </Typography>
              <br/>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        최근 가격 vs 올해 평균 (최대/최소 포함) 
      </Typography>

      <Box sx={{ display: "flex", gap: 3, flexDirection: "row", flexWrap: "wrap" }}>
        {Object.entries(groupedByRank).length > 0 ? (
          Object.entries(groupedByRank).map(([rank, items], index) => {
            const todayPrice = items.find(item => item.dpr1 !== "-")?.dpr1 ?? null;
            const today = items.find(item => item.dpr1 !== "-")?.regday ?? null;
            const yearData = yearlySalesList[index]?.items?.[0];
            if (!yearData) return null;

            const yearAvg = yearData.avg;
            const yearMax = yearData.max;
            const yearMin = yearData.min;
            const isSingle = Object.entries(groupedByRank).length === 1;
            return (
              <Box key={rank} mb={2} sx={{
            minWidth: 0,
            
            flexBasis: {
              xs: "100%", 
              sm: isSingle ? "50%" : "auto", 
            },
          }}>
                <TodayPriceComparisonChart
                  todayPrice={todayPrice}
                  today = {today}
                  yearAvg={yearAvg}
                  yearMax={yearMax}
                  yearMin={yearMin}
                  rank={rank}
                />
              </Box>
            );
          })
        ) : (
          <Typography>데이터가 없습니다.</Typography>
        )}
      </Box>
        {Object.entries(groupedByRank).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {Object.keys(groupedByRank).map(rank => (
                    <Button
                      key={rank}
                      variant={selectedRank === rank ? "contained" : "outlined"}
                      sx={{ mr: 1, mb: 1 }}
                      onClick={() => handleRankSelect(rank)}
                    >
                      {rank}
                    </Button>
                  ))}
                </Box>
              )}
      <Box sx={{py:5}}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          최근 가격 추이
        </Typography>
        <OneWeekLineChart data={oneWeekChart} />
      </Box>

      <Box>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          지역별 가격 비교
        </Typography>
        <RegionBarChart data={filteredRegionData}/>
      </Box>

      <Box >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          연도별 월간 가격 비교
        </Typography>
        <YearTabsMonthlyChart data={filteredMonthlySalesList}/>
      </Box>

      <Box sx={{ pt:5 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        농산물 가격 종합 분석 결과
      </Typography>
      <Result latestDay={latestDay} itemName={itemName} selectedRank={selectedRank} todayPrice={todayPrice} prevPrice={prevPrice} prevWeekPrice = {prevWeekPrice} prevMonthPrice={prevMonthPrice} prevYearPrice={prevYearPrice} filteredYearAvg = {filteredYearAvg} commonYearAvg = {commonYearAvg} changes={changes} regionData={regionData} common5Year={common5Year} maxMinRegion={maxMinRegion} maxRegion={maxRegion} minRegion={minRegion} oneWeekChart={oneWeekChart} currentRegion={currentRegion} />
    </Box>
    </Container>
  );
}

export default Detail;