import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Paper, Typography, Stack, MenuItem,
    Accordion, AccordionSummary, AccordionDetails, Switch
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllBanners, createBanner, updateBanner, deleteBanner } from "../../service/BannerService";

export default function AdminBannerPage() {

  const [banners, setBanners] = useState([])

  const [form, setForm] = useState({
    bannerId: null,
    title: "",
    mainText: "",
    subText: "",
    imageUrl: "",
    linkUrl: "",
    sortOrder: 1,
    useYn: "Y",
    position: "MAIN"
  })

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await getAllBanners()
    setBanners(data)
  }

  const validateImageUrl = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => reject(false)
        img.src = url
    })
  }

  const handleCreate = async () => {

    if (!form.title.trim()) {
        alert("제목을 입력해주세요.")
        return
    }

    if (!form.imageUrl.trim()) {
        alert("이미지 URL을 입력해주세요.")
        return
    }

    try {
        await validateImageUrl(form.imageUrl)
    } catch {
        alert("유효하지 않은 이미지 URL입니다.")
        return
    }

    try {
        await createBanner(form)
        resetForm()
        load()
    } catch (err) {
        console.error("배너 등록 실패:", err)
        alert("배너 등록 중 오류가 발생했습니다.")
    }
  }

  //배너 수정
  const handleUpdate = async () => {

    if (!form.title.trim()) {
        alert("제목을 입력해주세요.")
        return
    }

    await updateBanner(form.bannerId, form)
        resetForm()
        load()
  }

  const handleDelete = async (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
        await deleteBanner(id)
        load()
    }
  }

  const setEditForm = (b) => {
    setForm({
        bannerId: b.bannerId,
        title: b.title ?? "",
        mainText: b.mainText ?? "",
        subText: b.subText ?? "",
        imageUrl: b.imageUrl,
        linkUrl: b.linkUrl,
        sortOrder: b.sortOrder,
        useYn: b.useYn,
        position: b.position
    })

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const resetForm = () => {
    setForm({
        bannerId: null,
        title: "",
        mainText: "",
        subText: "",
        imageUrl: "",
        linkUrl: "",
        sortOrder: 1,
        useYn: "Y",
        position: "MAIN"
    })
  }

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Stack spacing={3} sx={{ width: "90%", maxWidth: "900px" }}>

        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#555",
            width: "85px",
            lineHeight: "25px",
            mt: "10px !important",
            borderBottom: "1px solid #c4c4c4"
          }}
        >
          배너 관리
        </Typography>

        <Paper
          sx={{
            p: 2,
            borderRadius: "10px",
            backgroundColor: "#f7f7f7",
            boxShadow: "none"
          }}
        >
          <Stack spacing={1.5}>

            <Stack direction="row" spacing={1.5} alignItems="center">

                {/* 배너 위치 */}
                <Stack direction="row" alignItems="center">
                    <Typography sx={{ width: "80px", fontSize: "13px", color: "#000", ml: "5px" }}>
                        배너 위치 :
                    </Typography>

                    <TextField
                    select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    size="small"
                    InputProps={{ disableUnderline: true }}
                    sx={{
                        width: "110px",
                        background: "#fff",
                        borderRadius: "10px",
                        "& fieldset": { border: "1px solid #e5e5e5" }
                    }}
                    >
                    <MenuItem value="MAIN">MAIN</MenuItem>
                    <MenuItem value="MID">MID</MenuItem>
                    </TextField>
                </Stack>

                {/* 정렬 순서 */}
                <Stack direction="row" alignItems="center">
                    <Typography sx={{ width: "80px", fontSize: "13px", color: "#000" }}>
                        정렬 순서 :
                    </Typography>

                    <TextField
                    value={form.sortOrder}
                    type="number"
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    size="small"
                    InputProps={{ disableUnderline: true }}
                    sx={{
                        width: "110px",
                        background: "#fff",
                        borderRadius: "10px",
                        "& fieldset": { border: "1px solid #e5e5e5" }
                    }}
                    />
                </Stack>

            </Stack>

            <TextField
              label="배너 제목 입력"
              value={form.title}
              onChange={(e) => {
                let value = e.target.value;

                if (value.length > 200) {
                  alert("제목은 200자를 초과할 수 없습니다.")
                  value = value.slice(0, 200)
                }

                setForm({ ...form, title: value })
              }}
              fullWidth
              size="small"
              InputProps={{ disableUnderline: true }}
              sx={{
                background: "#fff",
                borderRadius: "10px",
                "& fieldset": { border: "1px solid #e5e5e5" }
              }}
            />

            <TextField
              label="등록 이미지 URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              fullWidth
              size="small"
              InputProps={{ disableUnderline: true }}
              sx={{
                background: "#fff",
                borderRadius: "10px",
                "& fieldset": { border: "1px solid #e5e5e5" }
              }}
            />

            <TextField
              label="클릭 시 이동할 링크 URL"
              value={form.linkUrl}
              onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              fullWidth
              size="small"
              InputProps={{ disableUnderline: true }}
              sx={{
                background: "#fff",
                borderRadius: "10px",
                "& fieldset": { border: "1px solid #e5e5e5" }
              }}
            />

            <TextField
                label="메인 문구"
                value={form.mainText}
                onChange={(e) => setForm({ ...form, mainText: e.target.value })}
                fullWidth size="small"
                sx={{ background:"#fff", borderRadius:"10px", "& fieldset": { border:"1px solid #e5e5e5" } }}
            />

            <TextField
                label="서브 문구 (1000자 이내)"
                value={form.subText}
                onChange={(e) => setForm({ ...form, subText: e.target.value })}
                fullWidth size="small"
                multiline //여러 줄 입력 허용
                minRows={4} //기본 높이
                maxRows={6}
                sx={{ background:"#fff", borderRadius:"10px", "& fieldset": { border:"1px solid #e5e5e5" } }}
            />

            {form.bannerId ? (
              <Button variant="contained" onClick={handleUpdate}
                sx={{ height: 30, borderRadius: "10px", background: "#ffe9d6", color: "#000", fontSize: "13px" }}>
                배너 수정
              </Button>
            ) : (
              <Button variant="contained" onClick={handleCreate}
                sx={{ height: 30, background: "#ffe9d6", color: "#000", borderRadius: "10px", fontSize: "13px" }}>
                배너 등록
              </Button>
            )}

            {form.bannerId && (
              <Button variant="outlined" onClick={resetForm}
                sx={{ height: 30, borderRadius: "10px", color: "#000", fontSize: "13px",
                    border: "1px solid #e5e5e5", background: "#fff" }}>
                    입력 초기화
              </Button>
            )}

          </Stack>
        </Paper>

        <Stack spacing={2}>
          {banners.map((b) => (
            <Accordion
              key={b.bannerId}
              sx={{
                borderRadius: "10px !important",
                border: "1px solid #e5e5e5",
                overflow: "hidden",
                background: "#fafafa"
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%" }}>

                  <img
                    src={b.imageUrl}
                    alt=""
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 8,
                      objectFit: "cover"
                    }}
                  />

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                      {b.title || `배너 #${b.bannerId}`}
                    </Typography>

                    <Typography sx={{ fontSize: 12, color: "#888" }}>
                      [ {b.position} ] 정렬 순서 : {b.sortOrder}번째
                    </Typography>
                  </Box>

                  <Switch
                    checked={b.useYn === "Y"}
                    onChange={(e) =>
                      updateBanner(b.bannerId, {
                        ...b,
                        title: b.title ?? "",
                        useYn: e.target.checked ? "Y" : "N"
                      }).then(load)
                    }
                  />

                  <EditIcon
                    onClick={() => setEditForm(b)}
                    sx={{ cursor: "pointer", color: "#555" }}
                  />

                  <DeleteIcon
                    onClick={() => handleDelete(b.bannerId)}
                    sx={{ cursor: "pointer", color: "#d9534f" }}
                  />

                </Stack>
              </AccordionSummary>

              <AccordionDetails sx={{ background: "#fff", padding: "10px" }}>

                <img
                  src={b.imageUrl}
                  alt=""
                  style={{
                    width: "100%",
                    maxHeight: "250px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    marginBottom: "10px"
                  }}
                />

                {/* 메인 문구 출력 */} 
                {b.mainText && (
                    <Typography sx={{ fontSize: 13, mb: 1, ml: 1 }}>
                        메인 문구 : {b.mainText}
                    </Typography>
                )}

                {/* 서브 문구 출력 */}
                {b.subText && (
                    <Typography sx={{ fontSize: 13, ml: 1, mb: 1 }}>
                        서브 문구 : {b.subText}
                    </Typography>
                )}

                <Typography sx={{ fontSize: 13, mb: 1, ml: 1 }}>
                  등록 이미지 주소 : {b.imageUrl}
                </Typography>
                <Typography sx={{ fontSize: 13, ml: 1 }}>
                  클릭 시 이동할 주소 : {b.linkUrl}
                </Typography>

              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>

      </Stack>
    </Box>
  )
}
