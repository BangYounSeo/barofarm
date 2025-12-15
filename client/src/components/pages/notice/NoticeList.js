// src/components/pages/notice/NoticeList.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Collapse,
  Pagination,
  Stack,
} from "@mui/material";
import NoticeDetail from "./NoticeDetail";

export default function NoticeList() {
  const [list, setList] = useState([]);
  const [expandedId, setExpandedId] = useState(null);   // 어떤 공지가 열려 있는지
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const loadList = async () => {
    try {
      const res = await fetch("/api/notice");

      if (!res.ok) {
        const text = await res.text();
        console.error("공지사항 목록 API 오류:", res.status, text);
        return;
      }

      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error("공지사항 목록 로드 실패:", err);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  // 현재 페이지에 보여줄 데이터 잘라오기
  const totalPages = Math.max(1, Math.ceil(list.length / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const currentPageList = list.slice(startIndex, startIndex + rowsPerPage);

  const handleRowClick = async (id) => {
    // 이미 열려 있는 행을 다시 클릭하면 닫기
    if (expandedId === id) {
      setExpandedId(null);
      setSelectedNotice(null);
      return;
    }

    try {
      setExpandedId(id);
      setLoadingId(id);

      const res = await fetch(`/api/notice/${id}`); // 조회수 증가 O
      if (!res.ok) {
        const text = await res.text();
        console.error("공지 상세 API 오류:", res.status, text);
        return;
      }
      const data = await res.json();

      setSelectedNotice(data);
      setLoadingId(null);

      // 리스트의 조회수도 최신값으로 업데이트
      setList((prev) =>
        prev.map((n) =>
          n.numNotice === id ? { ...n, viewCount: data.viewCount } : n
        )
      );
    } catch (err) {
      console.error("공지 상세 불러오기 실패:", err);
      setLoadingId(null);
    }
  };

  const handleCloseDetail = () => {
    setExpandedId(null);
    setSelectedNotice(null);
  };

  const handleChangePage = (_event, value) => {
    setPage(value);
    // 페이지 변경 시 펼쳐진 상세 닫기
    setExpandedId(null);
    setSelectedNotice(null);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
        >
          공지사항
        </Typography>

        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Table size="small">
            <TableHead sx={{ bgcolor: "grey.100" }}>
              <TableRow>
                <TableCell sx={{ width: 80 }}>번호</TableCell>
                <TableCell>제목</TableCell>
                <TableCell sx={{ width: 130 }}>작성일</TableCell>
                <TableCell sx={{ width: 80 }} align="right">
                  조회수
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {currentPageList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      등록된 공지사항이 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                currentPageList.map((n) => (
                  <React.Fragment key={n.numNotice}>
                    {/* 목록 행 */}
                    <TableRow
                      hover
                      sx={{
                        cursor: "pointer",
                        "&:hover > td": { bgcolor: "grey.50" },
                      }}
                      onClick={() => handleRowClick(n.numNotice)}
                    >
                      <TableCell>{n.numNotice}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          {n.pin && (
                            <Chip
                              label="공지"
                              size="small"
                              color="warning"
                              sx={{ fontSize: 11, height: 22 }}
                            />
                          )}
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: n.strong ? 700 : 400,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 380,
                            }}
                          >
                            {n.subject}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {n.createdAt?.slice(0, 10)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {n.viewCount}
                        </Typography>
                      </TableCell>
                    </TableRow>

                    {/* 제목 아래에 펼쳐지는 디테일 영역 */}
                    <TableRow>
                      <TableCell colSpan={4} sx={{ p: 0 }}>
                        <Collapse
                          in={expandedId === n.numNotice}
                          timeout="auto"
                          unmountOnExit
                        >
                          <NoticeDetail
                            notice={
                              expandedId === n.numNotice ? selectedNotice : null
                            }
                            loading={loadingId === n.numNotice}
                            onClose={handleCloseDetail}
                          />
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </Box>

        {/* 페이징 */}
        {list.length > 0 && (
          <Stack
            direction="row"
            justifyContent="center"
            sx={{ mt: 3 }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={handleChangePage}
              shape="rounded"
              color="primary"
              siblingCount={1}
              boundaryCount={1}
            />
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
