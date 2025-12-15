package com.barofarm.barofarm.service;

import java.io.ByteArrayInputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;


    /**
     * 바이트 데이터를 S3에 업로드하고 공개 URL 반환
     * (공용 — 절대 수정 ❌)
     */
    public String uploadFileFromBytes(byte[] bytes, String folderName, String fileName) {

        String key = folderName + "/" + fileName;

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(bytes.length);
        metadata.setContentType("image/png");

        try (ByteArrayInputStream bais = new ByteArrayInputStream(bytes)) {

            PutObjectRequest request =
                    new PutObjectRequest(bucketName, key, bais, metadata)
                            .withCannedAcl(CannedAccessControlList.PublicRead);

            amazonS3.putObject(request);

            return amazonS3.getUrl(bucketName, key).toString();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("S3 업로드 실패", e);
        }
    }


    /**
     * MultipartFile을 직접 S3에 업로드하고
     * 리뷰 이미지 저장에 필요한 모든 정보 반환
     */
    public S3UploadResult uploadFile(MultipartFile file) throws Exception {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("업로드할 파일이 없습니다!");
        }

        String originalName = file.getOriginalFilename();
        String ext = originalName.substring(originalName.lastIndexOf(".")); // 확장자
        String fileName = UUID.randomUUID().toString() + ext; // 랜덤 파일명 생성

        byte[] bytes = file.getBytes();

        // 기존 공통 업로드 기능 활용
        String url = uploadFileFromBytes(bytes, "review", fileName);

        // 리뷰 서비스에서 DB 저장을 위해 아래 필드 필요
        return new S3UploadResult(
                url,                    // 전체 접근 URL
                fileName,               // DB 저장용 파일명
                "/review/",             // 접근 경로
                originalName            // 원본 이름
        );
    }


    /**
     * 리뷰 이미지 저장 결과 DTO
     */
    @Getter
    @AllArgsConstructor
    public static class S3UploadResult {
        private final String url;
        private final String saveFileName;
        private final String path;
        private final String originalFileName;
    }
}
