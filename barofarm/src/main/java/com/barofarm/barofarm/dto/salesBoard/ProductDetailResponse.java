package com.barofarm.barofarm.dto.salesBoard;

import java.time.LocalTime;
import java.util.List;

import com.barofarm.barofarm.dto.member.ProducerDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
//여러 DTO 를 묶는 통합 DTO -> Service에서 하나씩 값을 넣어주는 방식, Getter + Setter (Service에서 조립)
public class ProductDetailResponse {
	
	private SalesBoardDetailResponse board;
    private List<BoardImageDTO> images;
    private List<OptionGroupDTO> optionGroups;
    private List<OptionDetailDTO> optionDetails;
    private ProducerDTO producer;
    private List<ReviewDTO> reviews;
    private List<QnaDTO> qnas;
    
    private String farmName;
    private String addr1;
    private String phone;
    private LocalTime startCall;
    private LocalTime endCall;
    
    private String bizNo;
    private String ceoName;

}
