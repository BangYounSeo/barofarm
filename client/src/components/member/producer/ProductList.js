import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Table,
  Typography,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import { useOutletContext, useNavigate } from "react-router-dom";
import { deletePost, updateStatus } from "../../../service/SalesList";
import { getMyBoards } from "../../../service/MemberService";

const categories = [
  { label: "전체보기", type: null, code: null },
  { label: "쌀·잡곡", type: "쌀·잡곡", code: "100" },
  { label: "채소", type: "채소", code: "200" },
  { label: "견과·버섯", type: "견과·버섯", code: "300" },
  { label: "과일", type: "과일", code: "400" },
];

// 상품에서 카테고리 라벨 가져오기 (productItem 코드 기준)
const getCategoryLabel = (p) => {
  const found = categories.find((c) => c.code === p.productType);
  return found ? found.label : p.productType || p.productItem || "";
};

const ProductList = () => {
  const { COLORS } = useOutletContext() || {};
  const navigate = useNavigate();
  const loginUserId = localStorage.getItem("userId");

  // 필터 / 검색 / 페이징 상태
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1); // 1-based (UI용)
  const [size, setSize] = useState(10);

  // 목록 & 필터링 결과
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);

  // 페이징 정보
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 드롭다운 상태 관리
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 상태 변경 즉시 화면에 반영하는 함수
  const updateLocalStatus = (numBrd, newStatus) => {
    setList((prev) =>
      (prev || []).map((p) =>
        p.numBrd === numBrd ? { ...p, status: newStatus } : p
      )
    );
  };

  // 내 상품 목록 불러오기 (Page<SalesBoardDTO>)
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyBoards({ page: page - 1, size }); // 백엔드는 0-base

        setList(data?.content || []);
        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [page, size]);

  // status + keyword 함께 반영해서 필터링
  useEffect(() => {
    let result = list || [];

    // 상태 필터
    if (filterStatus === "ON") {
      result = result.filter(
        (item) => item.status === "common" && item.stock > 0
      );
    } else if (filterStatus === "OFF") {
      result = result.filter((item) => item.status === "stop");
    } else if (filterStatus === "SOLD_OUT") {
      result = result.filter((item) => item.stock === 0);
    }

    // 검색 필터 (상품명 / 카테고리 라벨)
    if (keyword.trim()) {
      const lower = keyword.toLowerCase();
      result = result.filter((p) => {
        const subject = (p.subject || "").toLowerCase();
        const categoryText = getCategoryLabel(p).toLowerCase();
        return subject.includes(lower) || categoryText.includes(lower);
      });
    }

    setFilteredList(result);
  }, [list, filterStatus, keyword]);

  // 상태 필터 버튼 클릭
  const handleFilterClick = (status) => {
    setFilterStatus(status);
  };

  // 검색어 입력
  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
  };

  // 삭제 기능
  const deleteBoard = async (numBrd) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deletePost(numBrd, loginUserId);

      const data = await getMyBoards({ page: page - 1, size });
      setList(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);

      alert("삭제되었습니다.");
    } catch (e) {
      console.error(e);
      alert("삭제 실패");
    }
  };

  // 페이지 변경
  const handlePageChange = (event, value) => {
    setPage(value); // 1-based
  };

  return (
    <Box>
      {/* 상단 헤더 영역 */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            상품 관리
          </Typography>
          <Typography variant="body2" sx={{ color: "#777", mt: 0.5 }}>
            등록된 상품을 조회하고, 판매 상태와 재고를 관리할 수 있어요.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 5,
            px: 3,
            bgcolor: COLORS?.primary || "#FF9F56",
            "&:hover": {
              bgcolor: COLORS?.primaryDark || "#f28735",
            },
          }}
          onClick={() =>
            navigate("/sales/write", {
              state: { returnTo: "/producer/products" },
            })
          }
        >
          상품 등록
        </Button>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* 검색 & 상태 필터 */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        {/* 상태 필터 */}
        <Stack direction="row" spacing={1}>
          <Chip
            label="전체"
            clickable
            color={filterStatus === "ALL" ? "primary" : "default"}
            variant={filterStatus === "ALL" ? "filled" : "outlined"}
            onClick={() => handleFilterClick("ALL")}
          />
          <Chip
            label="판매중"
            clickable
            color={filterStatus === "ON" ? "primary" : "default"}
            variant={filterStatus === "ON" ? "filled" : "outlined"}
            onClick={() => handleFilterClick("ON")}
          />
          <Chip
            label="판매중지"
            clickable
            color={filterStatus === "OFF" ? "primary" : "default"}
            variant={filterStatus === "OFF" ? "filled" : "outlined"}
            onClick={() => handleFilterClick("OFF")}
          />
          <Chip
            label="품절"
            clickable
            color={filterStatus === "SOLD_OUT" ? "primary" : "default"}
            variant={filterStatus === "SOLD_OUT" ? "filled" : "outlined"}
            onClick={() => handleFilterClick("SOLD_OUT")}
          />
        </Stack>

        {/* 검색창 */}
        <TextField
          size="small"
          placeholder="상품명 / 카테고리 검색"
          value={keyword}
          onChange={handleKeywordChange}
          sx={{ width: { xs: "100%", sm: 260 } }}
        />
      </Stack>

      {/* 상품 리스트 테이블 */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              {/* 번호: 더 좁게 */}
              <TableCell
                align="center"
                width={60}
                sx={{ px: 1, whiteSpace: "nowrap" }}
              >
                번호
              </TableCell>
              {/* 상품명: 넓게, 두 줄까지 */}
              <TableCell sx={{ minWidth: 260 }}>상품명</TableCell>
              {/* 카테고리: 코드 대신 라벨, 조금 넓게 */}
              <TableCell align="center" sx={{ minWidth: 60 }}>
                카테고리
              </TableCell>
              {/* 판매가: 한 줄로 충분히 보이도록 폭 확보 */}
              <TableCell align="right" sx={{ minWidth: 60 }}>
                판매가
              </TableCell>
              <TableCell align="right" sx={{ minWidth: 40 }}>
                재고
              </TableCell>
              <TableCell align="center" sx={{ minWidth: 110 }}>
                상태
              </TableCell>
              <TableCell align="center" width={120}>
                관리
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: "#888" }}>
                    조건에 맞는 상품이 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((p, idx) => (
                <TableRow key={p.numBrd} hover>
                  {/* 번호 (현재 페이지 기준) */}
                  <TableCell align="center" sx={{ px: 1 }}>
                    {(page - 1) * size + (idx + 1)}
                  </TableCell>

                  {/* 상품명: 최대 2줄, 넘치면 말줄임 */}
                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 500,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        wordBreak: "break-all",
                        fontSize: 14,
                      }}
                    >
                      {p.subject}
                    </Typography>
                  </TableCell>

                  {/* 카테고리: 코드 대신 라벨 */}
                  <TableCell align="center">
                    <Typography variant="body2">
                      {getCategoryLabel(p)}
                    </Typography>
                  </TableCell>

                  {/* 판매가 */}
                  <TableCell align="right">
                    {p.price?.toLocaleString()}원
                  </TableCell>

                  {/* 재고 */}
                  <TableCell align="right">
                    {p.stock?.toLocaleString()}
                  </TableCell>

                  {/* 상태 */}
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={
                        p.stock === 0
                          ? p.status === "stop"
                            ? "품절(중지됨)"
                            : "품절"
                          : p.status === "stop"
                          ? "판매중지"
                          : "판매중"
                      }
                      color={
                        p.stock === 0
                          ? "warning"
                          : p.status === "stop"
                          ? "default"
                          : "success"
                      }
                      variant="outlined"
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedProduct(p);
                      }}
                    />

                    {/* 상태 선택 메뉴 */}
                    <Menu
                      anchorEl={anchorEl}
                      open={
                        Boolean(anchorEl) &&
                        selectedProduct?.numBrd === p.numBrd
                      }
                      onClose={() => setAnchorEl(null)}
                    >
                      <MenuItem
                        disabled={p.status === "common"}
                        onClick={async () => {
                          await updateStatus(p.numBrd, "common");
                          updateLocalStatus(p.numBrd, "common");
                          setAnchorEl(null);
                        }}
                      >
                        판매중
                      </MenuItem>

                      <MenuItem
                        disabled={p.status === "stop"}
                        onClick={async () => {
                          await updateStatus(p.numBrd, "stop");
                          updateLocalStatus(p.numBrd, "stop");
                          setAnchorEl(null);
                        }}
                      >
                        판매중지
                      </MenuItem>
                    </Menu>
                  </TableCell>

                  {/* 관리 버튼 */}
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigate(`/sales/edit/${p.numBrd}`, {
                          state: { returnTo: "/producer/products" },
                        })
                      }
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>

                    <IconButton onClick={() => deleteBoard(p.numBrd)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Stack mt={2} alignItems="center" spacing={0.5}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            size="small"
          />
          <Typography variant="caption" sx={{ color: "#888" }}>
            총 {totalElements.toLocaleString()}개 상품
          </Typography>
        </Stack>
      )}
    </Box>
  );
};

export default ProductList;
