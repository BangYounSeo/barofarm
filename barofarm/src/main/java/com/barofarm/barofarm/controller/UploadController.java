package com.barofarm.barofarm.controller;

import com.barofarm.barofarm.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/upload")
public class UploadController {

    private final S3Service s3Service;

    @PostMapping("/base64")
    public String uploadBase64(@RequestParam("base64") String base64,
                               @RequestParam("fileName") String fileName) {
        try {
            // Base64 헤더 제거
            String base64Data = base64.split(",")[1];
            byte[] bytes = Base64.getDecoder().decode(base64Data);

            // 업로드 폴더명
            String folder = "description";

            // S3 업로드 → URL 반환
            return s3Service.uploadFileFromBytes(bytes, folder, fileName);

        } catch (Exception e) {
            throw new RuntimeException("이미지 업로드 실패", e);
        }
    }
}
