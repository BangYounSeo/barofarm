// src/components/admin/AdminProducerList.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Button,
  Stack,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  fetchProducers,
  updateProducerStatus,
} from "../../service/AdminService";
import AdminProducerDetailModal from "./AdminProducerDetailModal";
import EditIcon from "@mui/icons-material/Edit";

export default function AdminProducerList() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProducer, setSelectedProducer] = useState(null);

  const openDetailModal = (producer) => {
    setSelectedProducer(producer);
    setDetailOpen(true);
  };

  const handleSaveDetail = async ({ status, reason }) => {
    if (!selectedProducer) return;

    await updateProducerStatus(selectedProducer.proId, {
      status,
      reason,
    });

    setDetailOpen(false);
    load(page); // 목록 다시 로딩
  };

  const [producers, setProducers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); //기본은 모두 불러오기

  // 페이징
  const [page, setPage] = useState(0); // 0-based
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // 상태 라벨
  const STATUS_LABEL = {
    PENDING: "대기",
    APPROVED: "승인",
    REJECTED: "반려",
    ON_HOLD: "보류",
  };

  // 목록 로드
  const load = async (targetPage = page) => {
    try {
      const params = {
        page: targetPage,
        size,
        keyword: keyword || undefined,
        status: statusFilter || undefined,
      };

      const res = await fetchProducers(params);
      const data = res?.data;
      const content = data?.content ?? data ?? [];

      setProducers(Array.isArray(content) ? content : []);

      if (data && typeof data.totalPages === "number") {
        setTotalPages(data.totalPages);
        setPage(data.number);
      } else {
        setTotalPages(1);
        setPage(0);
      }
    } catch (err) {
      console.error("❌ producer load error", err);
      setProducers([]);
      alert("셀러 목록을 불러오지 못했습니다: " + err.message);
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (event, value) => {
    const targetPage = value - 1;
    load(targetPage);
  };

  const handleSearch = () => {
    // 검색/필터 바꿀 때는 첫 페이지부터
    load(0);
  };

  // 상태 변경
  const handleChangeStatus = async (proId, newStatus) => {
    if (
      !window.confirm(
        `상태를 '${STATUS_LABEL[newStatus]}'(으)로 변경하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      await updateProducerStatus(proId, newStatus);
      alert("상태가 변경되었습니다.");
      load(page);
    } catch (err) {
      console.error("❌ updateProducerStatus error", err);
      alert("상태 변경에 실패했습니다: " + err.message);
    }
  };

  return (
    <Box>
      <AdminProducerDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        producer={selectedProducer}
        onSave={handleSaveDetail}
      />

      <Typography variant="h6" sx={{ mb: 2 }}>
        셀러 승인 관리
      </Typography>

      {/* 검색/필터 영역 */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          size="small"
          placeholder="농가명 / 아이디 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">
            <em>전체 상태</em>
          </MenuItem>
          <MenuItem value="PENDING">대기</MenuItem>
          <MenuItem value="APPROVED">승인</MenuItem>
          <MenuItem value="REJECTED">반려</MenuItem>
          <MenuItem value="ON_HOLD">보류</MenuItem>
        </Select>

        <IconButton onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* 테이블 */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{/* Edit 버튼 */}</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>농가명</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>아이디</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>전화번호</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>주소</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>상태</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>운영시간</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {producers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                등록된 셀러가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            producers.map((p) => (
              <TableRow key={p.proId}>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => openDetailModal(p)}
                    aria-label="수정"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>

                <TableCell>{p.farmName}</TableCell>
                <TableCell>{p.memberUserId}</TableCell>
                <TableCell>{p.callCenter}</TableCell>
                <TableCell>
                  {p.addr1} {p.addr2}
                </TableCell>
                <TableCell>{STATUS_LABEL[p.status] || p.status}</TableCell>
                <TableCell>
                  {p.startCall && p.endCall
                    ? `${p.startCall} ~ ${p.endCall}`
                    : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* 페이징 */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
