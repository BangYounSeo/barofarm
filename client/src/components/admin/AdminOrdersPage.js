// src/components/admin/AdminOrdersPage.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Chip,
  CircularProgress,
  Pagination,
  Stack,
  TextField,     // 🔥 추가
  Select,        // 🔥 추가
  MenuItem,      // 🔥 추가
  Button,
  IconButton,        // 🔥 추가
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import dayjs from "dayjs";
import { fetchOrders, fetchOrderDetail } from "../../service/AdminService";
import AdminOrderDetailModal from "./AdminOrderDetailModal";
import SearchIcon from "@mui/icons-material/Search";

const PAGE_SIZE = 10; // ✅ 한 페이지에 10개씩

// 🔹 상태 레이블/색상 (enum 기준) - Modal 과 동일하게
const STATUS_LABEL = {
  readypay: "결제 대기",
  PAID: "결제 완료",
  CANCEL: "주문 취소",
  SHIPPING: "배송중",
  COMPLETE: "배송완료",
  REFUNDING: "환불중",
  REFUNDED: "환불완료",
  PARTIAL_CANCELLATION: "부분취소",
  PARTIAL_REFUND:"부분환불",
  CANCELLATION_REFUND:"취소/환불",
  PARTIAL_CANCELLATION_REFUND:"부분 취소/환불",
};

const STATUS_COLOR = {
  readypay: "#FFDD57",
  PAID: "#FFB03A",
  CANCEL: "#B0BEC5",
  SHIPPING: "#4FC3F7",
  COMPLETE: "#81C784",
  REFUNDING: "#FFD54F",
  REFUNDED: "#9575CD",
  PARTIAL_CANCELLATION: "#FFB03A",
  PARTIAL_REFUND: "#9575CD",
  CANCELLATION_REFUND:"#9575CD",
  PARTIAL_CANCELLATION_REFUND:"#9575CD",
};

// 🔥 디테일 상태를 기준으로 주문 행 상태 요약
function summarizeOrderStatus(order) {
  var base = order.paymentStatus || "READYPAY"; // 기본은 결제 상태
  var suffix = null; // 괄호 안 텍스트 (부분취소 / 부분환불)
  var details = order.details || [];

  if (!details.length) {
    return { baseStatus: base, suffix: suffix };
  }

  // 상태별 개수 세기
  var counts = details.reduce(function (acc, d) {
    var s = d.status || "UNKNOWN";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  var total = details.length;
  var statuses = Object.keys(counts);

  // 1) N개가 모두 같은 경우 => 그 상태로 덮어쓰기
  if (statuses.length === 1) {
    base = statuses[0]; // ex) 모두 CANCEL, 모두 SHIPPING 등
    return { baseStatus: base, suffix: null };
  }

  // 2) 결제 완료(PAID)에서만 부분취소 / 부분환불 처리
  if (base === "PAID") {
    var cancelCnt = counts.CANCEL || 0;
    var refundedCnt = counts.REFUNDED || 0;

    // 1~N-1개만 CANCEL이면 부분취소
    if (cancelCnt > 0 && cancelCnt < total) {
      suffix = "부분취소";
    }
    // 1~N-1개만 REFUNDED이면 부분환불
    else if (refundedCnt > 0 && refundedCnt < total) {
      suffix = "부분환불";
    }
  }

  // 그 외에는 원래 결제 상태 그대로 사용
  return { baseStatus: base, suffix: suffix };
}


export default function AdminOrdersPage() {
  const [pageData, setPageData] = useState(null);
  const [page, setPage] = useState(0); // 0-based
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔍 검색 상태
  const [keyword, setKeyword] = useState("");      // 주문번호 / 구매자 / 판매자 검색어
  const [searchType, setSearchType] = useState("ALL"); // 전체 / 주문번호 / 구매자 / 판매자

  // 🔥 펼친 주문 + 상세데이터 상태
  const [expandedId, setExpandedId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

   const loadOrders = async (pageIndex = 0, overrideKeyword, overrideSearchType) => {
    try {
      setLoading(true);
      setError("");

      // 🔍 함수 인자로 들어온 값이 있으면 우선 사용, 없으면 state 값 사용
      const q = overrideKeyword !== undefined ? overrideKeyword : keyword;
      const type = overrideSearchType !== undefined ? overrideSearchType : searchType;

      // ✅ pageIndex, PAGE_SIZE + 검색조건으로 서버에서 페이징
      const res = await fetchOrders({
        page: pageIndex,
        size: PAGE_SIZE,
        keyword: q && q.trim() !== "" ? q.trim() : undefined,
        searchType: type === "ALL" ? undefined : type, // ALL이면 필터 안 보냄
      });

      setPageData(res.data);
    } catch (e) {
      console.error(e);
      setError("주문 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 검색 버튼 클릭
  const handleSearch = () => {
    const q = keyword.trim();
    // 검색 시 항상 첫 페이지부터
    setPage(0);
    loadOrders(0, q, searchType);
  };

  // 🔥 상세 모달에서 디테일 상태가 바뀔 때 호출되는 콜백
  const handleOrderUpdate = (updatedOrder) => {
    // 상세 패널 데이터 갱신
    setSelectedOrder(updatedOrder);

    // 디테일 기준으로 주문 상태 요약
    const summary = summarizeOrderStatus(updatedOrder);

    // 목록 테이블의 해당 행 갱신
    setPageData(function (prev) {
      if (!prev) return prev;
      const newContent = (prev.content || []).map(function (o) {
        if (o.numPurG === updatedOrder.numPurG) {
          return Object.assign({}, o, {
            // 행에서 사용할 상태
            paymentStatus: summary.baseStatus,
            partialSuffix: summary.suffix,
          });
        }
        return o;
      });
      return Object.assign({}, prev, { content: newContent });
    });
  };


  useEffect(() => {
    loadOrders(page);
  }, [page]);

  const orders = pageData && pageData.content ? pageData.content : [];

  const handlePageChange = (event, value) => {
    // MUI Pagination 은 1-based, 서버는 0-based
    setPage(value - 1);
  };

  // 🔥 행 클릭 시: 열려있으면 닫고, 아니면 상세 조회 후 아래로 슬라이드
  const handleRowClick = async (row) => {
    if (expandedId === row.numPurG) {
      // 이미 열려있으면 접기
      setExpandedId(null);
      return;
    }

    try {
      setDetailLoading(true);
      setSelectedOrder(null);
      setExpandedId(row.numPurG);

      const res = await fetchOrderDetail(row.numPurG);
      setSelectedOrder(res.data);
    } catch (e) {
      console.error(e);
      setExpandedId(null);
      alert("주문 상세를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setDetailLoading(false);
    }
  };

  const renderStatusChip = (row) => {
    const base = row.paymentStatus || "READYPAY"; // summarize에서 세팅
    const suffix = row.partialSuffix; // "부분취소" / "부분환불" or undefined

    const baseLabel = STATUS_LABEL[base] || base;
    const label =
      base === "PAID" && suffix
        ? baseLabel + " (" + suffix + ")"
        : baseLabel;

    const color = STATUS_COLOR[base] || "#CFD8DC";

    return (
      <Chip
        label={label}
        size="small"
        sx={{
          bgcolor: color,
          color: "#fff",
          fontSize: 12,
          fontWeight: 500,
        }}
      />
    );
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        주문 / 결제 관리
      </Typography>

      <Paper sx={{ p: 2 }}>
        {loading && (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && (
          <>
            {/* 🔍 검색 영역 (셀러승인 페이지 스타일) */}
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              {/* 어떤 걸 기준으로 검색할지 선택 */}
              <Select
                size="small"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                displayEmpty
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="ALL">전체</MenuItem>
                <MenuItem value="ORDER_NO">주문번호</MenuItem>
                <MenuItem value="BUYER">구매자</MenuItem>
                <MenuItem value="SELLER">판매자</MenuItem>
              </Select>

              {/* 검색어 입력 */}
              <TextField
                size="small"
                placeholder="주문번호 / 구매자 / 판매자 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                sx={{ width: 260 }}
              />

              <IconButton
                variant="contained"
                size="small"
                onClick={handleSearch}
              >
                <SearchIcon/>
              </IconButton>
            </Box>

         

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: "nowrap"  }}>주문번호</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap"  }}>주문일자</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap"  }}>구매자</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap"  }}>판매자</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap"  }}>총금액</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap"  }}>상태</TableCell>
                </TableRow>
              </TableHead>

                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        주문이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((row) => (
                      <React.Fragment key={row.numPurG}>
                        <TableRow
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleRowClick(row)}
                        >
                          <TableCell>{row.numPurG}</TableCell>
                          <TableCell>
                            {row.orderDate
                              ? dayjs(row.orderDate).format("YYYY-MM-DD HH:mm")
                              : "-"}
                          </TableCell>

                          {/* 구매자 */}
                          <TableCell>{row.userId}</TableCell>

                          {/* 판매자 */}
                          <TableCell>{row.sellerName || "-"}</TableCell>

                          <TableCell align="right">
                            {row.totalPrice != null
                              ? row.totalPrice.toLocaleString() + "원"
                              : "-"}
                          </TableCell>

                          <TableCell>{renderStatusChip(row)}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell colSpan={6} sx={{ p: 0, borderBottom: 0 }}>
                            <Collapse
                              in={expandedId === row.numPurG}
                              timeout="auto"
                              unmountOnExit
                            >
                              <AdminOrderDetailModal
                                order={
                                  expandedId === row.numPurG ? selectedOrder : null
                                }
                                loading={detailLoading}
                                onOrderUpdate={handleOrderUpdate}
                              />
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))
                  )}
                </TableBody>

            </Table>

            {/* ✅ 전체 주문이 10개를 초과하면 totalPages > 1 이라 Pagination 표시 */}
            {pageData && pageData.totalPages > 1 && (
              <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
                <Pagination
                  page={page + 1}
                  count={pageData.totalPages}
                  onChange={handlePageChange}
                  size="small"
                />
              </Stack>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
