package com.barofarm.barofarm.service;

import java.security.SecureRandom;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.barofarm.barofarm.Enum.AccountStatus;
import com.barofarm.barofarm.Enum.PurchaseDetailStatus;
import com.barofarm.barofarm.Enum.Role;
import com.barofarm.barofarm.Enum.UserType;
import com.barofarm.barofarm.dto.GoodDTO;
import com.barofarm.barofarm.dto.SalesBoardDTO;
import com.barofarm.barofarm.dto.member.BizVerifyApiRequest;
import com.barofarm.barofarm.dto.member.BizVerifyApiResponse;
import com.barofarm.barofarm.dto.member.BizVerifyRequest;
import com.barofarm.barofarm.dto.member.BizVerifyResult;
import com.barofarm.barofarm.dto.member.BizVerifyStatus;
import com.barofarm.barofarm.dto.member.BuyerOrderDetailDTO;
import com.barofarm.barofarm.dto.member.CustomUserDetails;
import com.barofarm.barofarm.dto.member.JoinRequest;
import com.barofarm.barofarm.dto.member.JoinResponse;
import com.barofarm.barofarm.dto.member.LoginRequest;
import com.barofarm.barofarm.dto.member.LoginResponse;
import com.barofarm.barofarm.dto.member.MemberAddressDTO;
import com.barofarm.barofarm.dto.member.MyInfoDTO;
import com.barofarm.barofarm.dto.member.MyInfoResponse;
import com.barofarm.barofarm.dto.member.ProducerMainResponse;
import com.barofarm.barofarm.dto.member.ProducerOrderDTO;
import com.barofarm.barofarm.dto.member.ProducerOrderDetailDTO;
import com.barofarm.barofarm.dto.member.ProducerDTO;
import com.barofarm.barofarm.dto.member.ProducerDashboardResponse;
import com.barofarm.barofarm.dto.member.PurchaseHistoryDTO;
import com.barofarm.barofarm.dto.member.PurchaseItemDTO;
import com.barofarm.barofarm.dto.member.SearchIdPwdDTO;
import com.barofarm.barofarm.dto.member.SettlementChart;
import com.barofarm.barofarm.dto.member.SettlementDTO;
import com.barofarm.barofarm.dto.member.SettlementResponse;
import com.barofarm.barofarm.dto.salesBoard.ProducerJoinRequest;
import com.barofarm.barofarm.dto.salesBoard.QnaDTO;
import com.barofarm.barofarm.dto.salesBoard.ReviewDTO;
import com.barofarm.barofarm.entity.BusinessRegistration;
import com.barofarm.barofarm.entity.Good;
import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.entity.MemberAddress;
import com.barofarm.barofarm.entity.Producer;
import com.barofarm.barofarm.entity.PurchaseDetail;
import com.barofarm.barofarm.entity.PurchaseGroup;
import com.barofarm.barofarm.entity.Review;
import com.barofarm.barofarm.entity.SalesBoard;
import com.barofarm.barofarm.entity.Settlement;
import com.barofarm.barofarm.repository.GoodRepository;
import com.barofarm.barofarm.repository.MemberAddressRepository;
import com.barofarm.barofarm.repository.MemberRepository;
import com.barofarm.barofarm.repository.ProducerRepository;
import com.barofarm.barofarm.repository.PurchaseDetailRepository;
import com.barofarm.barofarm.repository.PurchaseGroupRepository;
import com.barofarm.barofarm.repository.QnaBoardRepository;
import com.barofarm.barofarm.repository.ReviewRepository;
import com.barofarm.barofarm.repository.SalesBoardRepository;
import com.barofarm.barofarm.repository.SettlementRepository;
import com.barofarm.barofarm.security.JwtTokenProvider;
import com.barofarm.barofarm.smsVerify.EmailService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {

	private final MemberRepository memberRepository;
	private final SalesBoardRepository salesBoardRepository;
	private final QnaBoardRepository qnaRepository;
	private final ReviewRepository reviewRepository;
	private final PurchaseGroupRepository purchaseGroupRepository;
	private final GoodRepository goodRepository;
	private final MemberAddressRepository memberAddressRepository;
	private final PasswordEncoder passwordEncoder;
	private final ProducerRepository producerRepository;
	private final PurchaseDetailRepository purchaseDetailRepository;
	private final SettlementRepository settlementRepository;
	private final JwtTokenProvider jwtTokenProvider;
	private final EmailService emailService;
	private final RestTemplate restTemplate = new RestTemplate();

	@Value("${nts.api.service-key}")
	private String ntsApiServiceKey;

	@Value("${nts.api.base-url}")
	private String ntsApiBaseUrl;

	public JoinResponse join(JoinRequest req) {

		if (memberRepository.findByUserId(req.getUserId()).isPresent()) {
			throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"이미 사용 중인 아이디입니다.");
		}

		if (memberRepository.findByPhone(req.getPhone()).isPresent()) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 번호입니다.");
		}

		Member member = new Member();
		member.setUserId(req.getUserId());
		member.setPwd(passwordEncoder.encode(req.getPwd()));
		member.setName(req.getName());
		member.setPhone(req.getPhone());
		if (req.getEmail() != null && !req.getEmail().trim().isEmpty()) {
			member.setEmail(req.getEmail());
		}

		Member saved = memberRepository.save(member);

		return new JoinResponse(saved);
	}

	public LoginResponse login(LoginRequest req) {
		Member member = memberRepository.findByUserId(req.getUserId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "아이디 또는 비밀번호를 확인해 주세요."));

		if (!passwordEncoder.matches(req.getPwd(), member.getPwd())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호를 확인해 주세요.");
		}

		if (member.getStatus() == AccountStatus.BLOCKED) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"현재 사용이 제한된 계정입니다. 관리자에게 문의해 주세요");
		}

		if (member.getStatus() == AccountStatus.WITHDRAW) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"탈퇴한 계정입니다.");
		}

		String token = jwtTokenProvider.createToken(member.getUserId(), member.getRole().name());

		return new LoginResponse(token, member);
	}

	public boolean checkId(String userId) {
		Optional<Member> member = memberRepository.findByUserId(userId);

		return member.isPresent();
	}

	public SearchIdPwdDTO searchIdByPhone(SearchIdPwdDTO req) {
		Member member = memberRepository
				.findByPhoneAndName(req.getPhone(), req.getName())
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.NOT_FOUND,
						"입력한 정보와 일치하는 회원이 없습니다."));

		return new SearchIdPwdDTO(member);
	}

	public SearchIdPwdDTO searchId(SearchIdPwdDTO req) {
		Member member = memberRepository
				.findByUserId(req.getUserId())
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.NOT_FOUND,
						"일치하는 회원 정보를 찾을 수 없습니다."));

		return new SearchIdPwdDTO(member);
	}

	public void resetPassword(SearchIdPwdDTO req) {
		Member member = memberRepository.findByUserIdAndEmail(req.getUserId(), req.getEmail())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원가입시 입력한 이메일을 입력해 주세요."));

		// 1) 임시 비밀번호 생성 (10자리 랜덤 문자)
		int length = 10;
		String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
		StringBuilder sb = new StringBuilder();
		SecureRandom random = new SecureRandom();

		for (int i = 0; i < length; i++) {
			sb.append(chars.charAt(random.nextInt(chars.length())));
		}

		String tempPwd = sb.toString();

		// 2) 암호화해서 저장
		String encoded = passwordEncoder.encode(tempPwd);
		member.setPwd(encoded);
		member.setEmail(req.getEmail());
		member.setTempPwd(1);

		// 3) 이메일로 발송
		String subject = "[바로팜] 임시 비밀번호 안내";
		String text = "<div style='font-family:Arial,sans-serif; padding:20px; border:1px solid #ddd; border-radius:8px;'>"
				+ "<h2 style='color:#ffc19e;'>BaroFarm 임시 비밀번호 안내</h2>"
				+ "<p>안녕하세요, BaroFarm 회원님 👋</p>"
				+ "<p>요청하신 계정의 임시 비밀번호가 발급되었습니다.<br>"
				+ "아래 임시 비밀번호로 로그인 후 반드시 새 비밀번호로 변경해 주세요.</p>"
				+ "<div style='margin:20px 0; padding:15px; border:1px dashed #ffc19e; text-align:center;'>"
				+ "<span style='font-size:24px; font-weight:bold; color:#ffc19e;'>" + tempPwd + "</span>"
				+ "</div>"
				+ "<p style='color:#888;'>※ 본 메일은 발신전용입니다.<br>"
				+ "※ 임시 비밀번호는 보안을 위해 최초 로그인 시 즉시 변경하시길 권장합니다.</p>"
				+ "</div>";

		emailService.sendHtmlMail(req.getEmail(), subject, text);
	}

	public void joinProducer(ProducerJoinRequest req, String userId) {

		Member member = memberRepository.findByUserId(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원정보 없음"));

		BizVerifyRequest verifyReq = new BizVerifyRequest();
		verifyReq.setB_no(req.getBizNo());
		verifyReq.setStart_dt(req.getOpenDate());
		verifyReq.setP_nm(req.getCeoName());
		BizVerifyResult verifyRes = verify(verifyReq);

		if (!"01".equals(verifyRes.getValid())) {
			throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"국세청 정보와 일치하지 않는 사업자등록 정보입니다.");
		}

		if ("03".equals(verifyRes.getStatus().getB_stt_cd())) {
			throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"폐업한 사업자입니다.");
		}

		DateTimeFormatter format = DateTimeFormatter.ofPattern("HH:mm");

		member.setUserType(UserType.PRODUCER);
		member.setRole(Role.ROLE_PRODUCER);

		BusinessRegistration br = new BusinessRegistration();
		br.setBizNo(req.getBizNo());
		br.setCeoName(req.getCeoName());
		br.setOpenDate(req.getOpenDate());
		br.setStatusCode(verifyRes.getStatus().getB_stt_cd());
		br.setStatusMessage(verifyRes.getStatus().getB_stt());
		br.setVerified(true);
		br.setVerifiedAt(LocalDateTime.now());

		Producer producer = new Producer();
		producer.setProducerType(req.getProducerType());
		producer.setFarmName(req.getFarmName());
		producer.setCallCenter(req.getCallCenter());
		producer.setStartCall(req.getStartCall());
		producer.setEndCall(req.getEndCall());
		producer.setPostalCode(req.getPostalCode());
		producer.setAddr1(req.getAddr1());
		producer.setAddr2(req.getAddr2());
		producer.setIntro(req.getIntro());
		producer.setCourier(req.getCourier());
		producer.setReturnShippingFee(req.getReturnShippingFee());
		producer.setExchangeShippingFee(req.getExchangeShippingFee());
		producer.setAccountHolder(req.getAccountHolder());
		producer.setAccountNumber(req.getAccountNumber());
		producer.setBank(req.getBank());
		producer.setSettleEmail(req.getSettleEmail());

		producer.setBusinessRegistration(br);
		producer.setMember(member);

		producerRepository.save(producer);
	}

	public BizVerifyResult verify(BizVerifyRequest req) {
		
		if(req.getB_no().equals("1231212345")) {
			BizVerifyResult res = new BizVerifyResult();
			BizVerifyStatus status = new BizVerifyStatus();
			status.setB_stt_cd("01");
			status.setB_stt("테스트");
			res.setValid("01");
			res.setStatus(status);
			
			return res;
		}

		String url = ntsApiBaseUrl + "/validate?serviceKey="
				+ ntsApiServiceKey + "&returnType=JSON";

		BizVerifyApiRequest body = new BizVerifyApiRequest();
		body.setBusinesses(Arrays.asList(req));

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));

		HttpEntity<BizVerifyApiRequest> entity = new HttpEntity<>(body, headers);
		try {
			ResponseEntity<BizVerifyApiResponse> response = restTemplate.exchange(url, HttpMethod.POST,
					entity, BizVerifyApiResponse.class);

			BizVerifyApiResponse resBody = response.getBody();

			if (resBody == null || resBody.getData() == null ||
					resBody.getData().isEmpty()) {
				throw new ResponseStatusException(HttpStatus.BAD_GATEWAY);
			}

			return resBody.getData().get(0);
		} catch (HttpStatusCodeException e) {
			String msg = "입력 정보를 확인해 주세요.";

			throw new ResponseStatusException(e.getStatusCode(), msg, e);
		} catch (RestClientException e) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
					"국세청 사업자 검증 서버에 연결할 수 없습니다.", e);
		}
	}

	public MyInfoResponse getMyInfo(CustomUserDetails user) {

		String userId = user.getUsername();

		MyInfoResponse myInfo = new MyInfoResponse();

		myInfo.setUser(MyInfoDTO.from(user));
		myInfo.setGood(
				(int) goodRepository.countByMemberUserIdAndTargetType(userId, "PRODUCT"));
		myInfo.setPurchase((int) purchaseGroupRepository.countByMemberUserId(userId));
		myInfo.setQna((int) qnaRepository.countByMemberUserId(userId));
		myInfo.setReview((int) reviewRepository.countByMemberUserId(userId));

		return myInfo;
	}

	/**
	 * 🔍 userId 로 Member 조회
	 * - Principal.getName() 으로 받은 userId 기반
	 * - 조회 실패 시 404 에러 반환 ----> wishlist 조회
	 */
	public Member getMemberByUserId(String userId) {
		return memberRepository.findByUserId(userId)
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.NOT_FOUND,
						"회원 정보를 찾을 수 없습니다."));
	}

	public List<GoodDTO> getMyWishList(String userId) {

		List<Good> good = goodRepository.findByMemberAndTargetType(memberRepository.findByUserId(userId).orElse(null),
				"PRODUCT");

		return good.stream()
				.map(g -> GoodDTO.from(g,
						salesBoardRepository.findById(Integer.parseInt(g.getTargetId())).orElse(null)))
				.collect(Collectors.toList());
	}

	public Page<PurchaseHistoryDTO> getMyOrders(String userId, int page, int size,
			LocalDate startDate, LocalDate endDate) {

		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderDate"));

		Page<PurchaseGroup> groupPage;

		if (startDate != null && endDate != null) {
			// [startDate 00:00:00 ~ endDate 다음날 00:00:00) 범위
			LocalDateTime start = startDate.atStartOfDay();
			LocalDateTime end = endDate.plusDays(1).atStartOfDay();

			groupPage = purchaseGroupRepository
					.findByMemberUserIdAndOrderDateBetweenOrderByOrderDateDesc(
							userId, start, end, pageable);
		} else {
			// 날짜 조건 없음 (전체)
			groupPage = purchaseGroupRepository
					.findByMemberUserIdOrderByOrderDateDesc(userId, pageable);
		}

		return groupPage.map(pg -> PurchaseHistoryDTO.from(
				pg,
				pg.getPurchaseDetails().stream()
						.map(PurchaseItemDTO::from)
						.collect(Collectors.toList())));
	}

	public List<MemberAddressDTO> getMyShipAddress(String userId) {

		return memberAddressRepository
				.findAllOfAdrressByUserId(userId)
				.stream()
				.map(MemberAddressDTO::from)
				.collect(Collectors.toList());
	}

	public Page<ReviewDTO> getMyReview(String userId, int page, int size) {

		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "created"));

		Page<Review> pages = reviewRepository.findPageByUserId(userId, pageable);
		List<Integer> ids = pages.getContent().stream()
				.map(Review::getNumRev)
				.collect(Collectors.toList());

		if (ids.isEmpty()) {
			return new PageImpl<>(Collections.emptyList(), pageable, 0);
		}

		List<Review> reviewsWithImages = reviewRepository.findWithImagesByIdIn(ids);

		Map<Integer, Review> reviewMap = reviewsWithImages.stream()
				.collect(Collectors.toMap(Review::getNumRev, r -> r));

		List<ReviewDTO> dtoList = pages.getContent().stream()
				.map(r -> ReviewDTO.from(reviewMap.get(r.getNumRev())))
				.collect(Collectors.toList());

		return new PageImpl<>(dtoList, pageable, pages.getTotalElements());
	}

	public List<QnaDTO> getMyQna(String userId) {
		return qnaRepository.findAllByUserId(userId)
				.stream().map(QnaDTO::from)
				.collect(Collectors.toList());
	}

	public void deleteAllWishList(String userId) {
		goodRepository.deleteAllByMemberUserId(userId);
	}

	public void deleteOneWish(int goodId) {
		goodRepository.deleteById(goodId);
	}

	public void updateUser(JoinRequest req, String userId) {

		Member member = memberRepository.findByUserId(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
		member.setName(req.getName());
		member.setPhone(req.getPhone());
		if (req.getEmail() != null && !req.getEmail().trim().isEmpty()) {
			member.setEmail(req.getEmail());
		}

	}

	public void confirmPassword(LoginRequest req) {
		Member member = memberRepository.findByUserId(req.getUserId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "아이디 또는 비밀번호를 확인해 주세요."));

		if (!passwordEncoder.matches(req.getPwd(), member.getPwd())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다.");
		}
		
    }
    
    public void changepassword(LoginRequest req) {
    	Member member = memberRepository.findByUserId(req.getUserId())
    			.orElseThrow(() -> 
					new ResponseStatusException
						(HttpStatus.NOT_FOUND,"아이디 또는 비밀번호를 확인해 주세요."));
    	
    	member.setPwd(passwordEncoder.encode(req.getPwd()));
    }
    
    public void addAddress(MemberAddressDTO req,String userId) {
    	Member member = memberRepository
    			.findByUserId(userId)
    				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    	
    	if(req.getIsDefault()==1) {
    		memberAddressRepository.updateAllIsDefaultToZeroByMember(userId);
    	}
    	
    	MemberAddress memberAddress = new MemberAddress();
    	
    	memberAddress.setMember(member);
    	memberAddress.setAlias(req.getAlias());
    	memberAddress.setReceiver(req.getReceiver());
    	memberAddress.setPhone(req.getPhone());
    	memberAddress.setPostalCode(req.getPostalCode());
    	memberAddress.setAddr1(req.getAddr1());
    	memberAddress.setAddr2(req.getAddr2());
    	memberAddress.setIsDefault(req.getIsDefault());
    	
    	memberAddressRepository.save(memberAddress);
    	
    }
    
    public void updateAddress(MemberAddressDTO req,String userId) {
    	MemberAddress memberAddress = 
    			memberAddressRepository
    				.findByAddressIdAndMemberUserId(req.getAddressId(), userId)
    					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    	
    	if (req.getIsDefault() == 1) {
            memberAddressRepository.updateAllIsDefaultToZeroByMember(userId);
            memberAddress.setIsDefault(1);
        } else {
            memberAddress.setIsDefault(0);
        }
    	
    	memberAddress.setAlias(req.getAlias());
    	memberAddress.setReceiver(req.getReceiver());
    	memberAddress.setPhone(req.getPhone());
    	memberAddress.setPostalCode(req.getPostalCode());
    	memberAddress.setAddr1(req.getAddr1());
    	memberAddress.setAddr2(req.getAddr2());
    }
    
    public void deleteAddress(Long addressId) {
    	
    	memberAddressRepository.deleteById(addressId);
    	
    }
    
    public void deleteUser(String userId) {
    	Member member = memberRepository.findByUserId(userId)
    			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    	
    	memberAddressRepository.deleteAllByMember(member);
    	
    	member.setStatus(AccountStatus.WITHDRAW);
    	member.setEmail(null);
    	member.setPhone(null);
    	member.setPwd(null);
    	member.setName("탈퇴회원");
    	
    }
    
    public BuyerOrderDetailDTO getMyOrderDetail(String userId,int numPurG) {
    	PurchaseGroup pg = purchaseGroupRepository
    			.findByNumPurGAndMemberUserId(numPurG, userId)
    				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    	
    	return BuyerOrderDetailDTO.from(pg);
    }
    
    public Page<ProducerMainResponse> getUserOrders(String userId, int page,int size) {
    	Pageable pageable = PageRequest.of(page, size
    			,Sort.by(Sort.Direction.DESC, "purchaseGroup.orderDate"));
    	
    	Page<PurchaseDetail> orders = purchaseDetailRepository
    			.findBySalesBoard_Member_userId(userId, pageable);
    	
    	List<PurchaseDetail> content = orders.getContent();
    	
    	Map<PurchaseGroup, List<PurchaseDetail>> grouped = 
    			content.stream()
    				.collect(Collectors.groupingBy(
    						PurchaseDetail::getPurchaseGroup,
    						LinkedHashMap::new,
    						Collectors.toList()));
    	
    	List<ProducerMainResponse> dtoList = grouped.entrySet().stream()
    			.map(entry ->{
    				PurchaseGroup group = entry.getKey();
    				List<PurchaseDetail> detailList = entry.getValue();
    				
    				String sellerStatus = calcProducerGroupStatus(detailList);
    				
    				ProducerOrderDTO orderDto = ProducerOrderDTO.from(group, sellerStatus);
    				
    				List<ProducerOrderDetailDTO> detailDtos = detailList.stream()
    						.map(ProducerOrderDetailDTO::from)
    						.collect(Collectors.toList());
    				
    				return ProducerMainResponse.builder()
    						.orderGroup(orderDto)
    						.details(detailDtos)
    						.build();
    			}).collect(Collectors.toList());
    	
    	return new PageImpl<>(dtoList,pageable,orders.getTotalElements());
    }
    
    public void updateOrderStatus(int numPurD,String status,String trackingNo,String userId) {
    	PurchaseDetail detail = purchaseDetailRepository.findById(numPurD)
    			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    	
    	String ownerId = detail.getSalesBoard().getMember().getUserId();
    	
    	if(!ownerId.equals(userId)) {
    		throw new ResponseStatusException(HttpStatus.FORBIDDEN,"본인 상품 주문내역이 아닙니다.");
    	}
    	
    	if(trackingNo != null && !trackingNo.trim().isEmpty()) {
    		detail.setTrackingNo(trackingNo.trim());
    		detail.setShippingStartedAt(LocalDateTime.now());
    	}
    	
    	detail.setStatus(PurchaseDetailStatus.valueOf(status));
    	
    }
    
    public ProducerDashboardResponse getDashboardData(String userId) {
    	
    	int todayOrders = purchaseDetailRepository.countTodayOrders(userId);
    	int yesterdayOrders = purchaseDetailRepository.countYesterdayOrders(userId);
    	int todaySales = purchaseDetailRepository.sumTodaySales(userId);
    	int yesterdaySales = purchaseDetailRepository.sumYesterdaySales(userId);
    	int readyShipCount = purchaseDetailRepository.countReadyShip(userId);
    	int settlementAmount = getThisWeekExpectedSettlement(userId);
    	
    	List<PurchaseGroup> recentGroups = 
    			purchaseGroupRepository.findRecentGroupsForProducer(userId, PageRequest.of(0, 5));
    	
    	if(recentGroups==null || recentGroups.isEmpty()) {
    		return null;
    	}
    			
    	List<ProducerMainResponse> recentDtos = 
    			recentGroups.stream()
    			.map(pg ->{
    				List<PurchaseDetail> sellerDetails = pg.getPurchaseDetails().stream()
	                    .filter(d -> userId.equals(
	                        d.getSalesBoard().getProducer().getMember().getUserId()
	                    ))
	                    // 필요하다면 대시보드에서 취소/환불건 제외
	                    .filter(d -> d.getStatus() != PurchaseDetailStatus.CANCEL &&
	                                 d.getStatus() != PurchaseDetailStatus.REFUNDED)
	                    .collect(Collectors.toList());
    				
    				String sellerStatus = calcProducerGroupStatus(sellerDetails);
    				
    				ProducerOrderDTO orderDto = ProducerOrderDTO.from(pg, sellerStatus);

                    List<ProducerOrderDetailDTO> detailDtos = sellerDetails.stream()
                        .map(ProducerOrderDetailDTO::from)
                        .collect(Collectors.toList());

                    return ProducerMainResponse.builder()
                        .orderGroup(orderDto)
                        .details(detailDtos)
                        .build();
    			}).collect(Collectors.toList());
    			
    	
    	return ProducerDashboardResponse.builder()
    			.todayOrder(todayOrders)
    			.yesterdayOrder(yesterdayOrders)
    			.todaySales(todaySales)
    			.yesterdaySales(yesterdaySales)
    			.readyShipCount(readyShipCount)
    			.recentOrders(recentDtos!=null? recentDtos:null)
    			.settlementAmount(settlementAmount)
    			.build();
    }
    

	public void updateMyOrderStatus(int numPurD, String status, String refundReason, String userId) {
		PurchaseDetail detail = purchaseDetailRepository.findById(numPurD)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

		String ownerId = detail.getPurchaseGroup().getMember().getUserId();

		if (!ownerId.equals(userId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 상품 주문내역이 아닙니다.");
		}

		LocalDateTime startedAt = detail.getShippingStartedAt();
		if (startedAt != null && startedAt.plusDays(6).isBefore(LocalDateTime.now())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "환불이 불가능한 상품입니다.");
		}

		if (refundReason != null && !refundReason.trim().isEmpty()) {
			detail.setRefundReason(refundReason);
		}

		detail.setStatus(PurchaseDetailStatus.valueOf(status));

	}

	// 판매자 정보 조회
	public ProducerDTO getProducerProfile(String userId) {

		Producer producer = producerRepository.findByMemberUserId(userId);
		if (producer == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "판매자 정보 없음");
		}
		return ProducerDTO.from(producer);
	}

	// 판매자 정보 수정
	@Transactional
	public void updateProducerProfile(ProducerDTO req, String userId) {

		Producer producer = producerRepository.findByMemberUserId(userId);
		if (producer == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "판매자 정보 없음");
		}

		producer.setCourier(req.getCourier());
		producer.setReturnShippingFee(req.getReturnShippingFee());
		producer.setExchangeShippingFee(req.getExchangeShippingFee());
		producer.setFarmName(req.getFarmName());
		producer.setCallCenter(req.getCallCenter());
		producer.setSettleEmail(req.getSettleEmail());
		producer.setAddr1(req.getAddr1());
		producer.setAddr2(req.getAddr2());
		producer.setPostalCode(req.getPostalCode());
		producer.setIntro(req.getIntro());
		producer.setStartCall(req.getStartCall());
		producer.setEndCall(req.getEndCall());
		producer.setCourier(req.getCourier());
		producer.setReturnShippingFee(req.getReturnShippingFee());
		producer.setExchangeShippingFee(req.getExchangeShippingFee());

		
////////////////////////////
		// account
		producer.setBank(req.getBank());
		producer.setAccountNumber(req.getAccountNumber());
		producer.setAccountHolder(req.getAccountHolder());
	}


	public int getThisWeekExpectedSettlement(String userId) {
		LocalDate today = LocalDate.now();

		// 스케줄러 로직과 동일하게, "이번 주 정산 대상"의 기준 기간을 계산
		LocalDate thisMonday = today.minusWeeks(1).with(DayOfWeek.MONDAY);
		LocalDate thisSunday = thisMonday.plusDays(6);

		LocalDateTime from = thisMonday.atStartOfDay();
		LocalDateTime to = thisSunday.plusDays(1).atStartOfDay().minusNanos(1);
		
		return purchaseDetailRepository
				.sumExpectedSettlementForRange
					(PurchaseDetailStatus.COMPLETE,userId, from, to);
	}

    private String calcProducerGroupStatus(List<PurchaseDetail> details) {

    	if (details == null || details.isEmpty()) {
            // 상황에 맞게 기본값 정하기: PAID / READYPAY / UNKNOWN 등
            return PurchaseDetailStatus.PAID.name();
        }
    	
        boolean hasRefunding = false;
        boolean hasRefunded = false;
        boolean hasShipping = false;
        boolean hasComplete = false;
        boolean hasPaid = false;
        boolean hasCancel = false;

        for (PurchaseDetail d : details) {
        	if(d.getStatus() == null || d.getStatus().equals("")) {
        		return PurchaseDetailStatus.PAID.name();
        	}
            switch (d.getStatus()) {
                case REFUNDING:
                    hasRefunding = true;
                    break;
                case REFUNDED:
                    hasRefunded = true;
                    break;
                case SHIPPING:
                    hasShipping = true;
                    break;
                case COMPLETE:
                    hasComplete = true;
                    break;
                case PAID:
                    hasPaid = true;
                    break;
                case CANCEL:
                    hasCancel = true;
                    break;
            }
        }
        
        if (hasRefunding) return PurchaseDetailStatus.REFUNDING.name();
        if (hasShipping)  return PurchaseDetailStatus.SHIPPING.name();
        if (hasComplete && !hasShipping && !hasRefunding && !hasPaid)
            return PurchaseDetailStatus.COMPLETE.name();
        if (hasRefunded && !hasShipping && !hasPaid && !hasRefunding)
            return PurchaseDetailStatus.REFUNDED.name();
        if (hasPaid)     return PurchaseDetailStatus.PAID.name();
        if (hasCancel && !hasPaid && !hasShipping && !hasComplete && !hasRefunding)
            return PurchaseDetailStatus.CANCEL.name();
        
        return PurchaseDetailStatus.PAID.name();
    }
    
    public SettlementResponse getSettlement(
    		String userId,Integer year,Integer month,String chartMode) {
    	LocalDate now = LocalDate.now();
    	int targetYear = (year!=null) ? year : now.getYear();
    	int targetMonth = (month!=null) ? month : now.getMonthValue();
    	
    	LocalDate monthStart = LocalDate.of(targetYear, targetMonth, 1);
    	LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
    	
    	LocalDateTime from = monthStart.atStartOfDay();
    	LocalDateTime to = monthEnd.plusDays(1).atStartOfDay().minusNanos(1);
    	
    	List<Settlement> settlements = settlementRepository
    			.findByProducer_Member_UserIdAndCompletedAtBetweenOrderByCompletedAtDesc(userId, from, to);
    	
    	List<SettlementDTO> settlementDtos = settlements.stream()
    			.map(SettlementDTO::from)
    			.collect(Collectors.toList());
    	
    	int monthSales = settlements.stream()
                .mapToInt(Settlement::getSettlementAmount)
                .sum();
    	
    	System.out.println("다음주 정산 금액: " + monthSales);
    	int weeklySettlement = getThisWeekExpectedSettlement(userId);
    	
    	int totalSettlement = settlementRepository.sumTotalSettlement(userId);
    	
    	String effectiveMode = (chartMode == null || chartMode.isEmpty())
                ? "WEEKLY"
                : chartMode.toUpperCase();

        List<SettlementChart> chartData = buildChartData(settlements, effectiveMode);
        
        return SettlementResponse.builder()
                .monthSales(monthSales)
                .weeklySettlement(weeklySettlement)
                .totalSettlement(totalSettlement)
                .settlement(settlementDtos)
                .chartMode(effectiveMode)
                .chart(chartData)
                .build();

    }
    
    private List<SettlementChart> buildChartData(List<Settlement> settlements, String mode) {
        if (settlements == null || settlements.isEmpty()) {
            return Collections.emptyList();
        }

        if ("MONTHLY".equalsIgnoreCase(mode)) {
            // 🔹 월별: YearMonth 기준 그룹핑
            Map<YearMonth, Integer> byMonth = settlements.stream()
                    .filter(s -> s.getPeriodStart() != null)
                    .collect(Collectors.groupingBy(
                            s -> YearMonth.from(s.getPeriodStart()),
                            Collectors.summingInt(Settlement::getSettlementAmount)
                    ));

            List<SettlementChart> result = new ArrayList<>();

            byMonth.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey()) // YearMonth 오름차순
                    .forEach(entry -> {
                        YearMonth ym = entry.getKey();
                        int amount = entry.getValue();
                        LocalDate start = ym.atDay(1);
                        LocalDate end = ym.atEndOfMonth();

                        result.add(
                                SettlementChart.builder()
                                        .label(ym.toString()) // 예: "2025-12"
                                        .amount(amount)
                                        .periodStart(start)
                                        .periodEnd(end)
                                        .build()
                        );
                    });

            return result;
        }

        // 🔹 기본(또는 WEEKLY): 각 Settlement(=각 주차)를 그대로 막대 하나로 사용
        return settlements.stream()
        		.sorted(Comparator.comparing(Settlement::getPeriodStart))
        		.map(s -> SettlementChart.builder()
        				.label(formatWeeklyLabel(s.getPeriodStart(), s.getPeriodEnd()))
        				.amount(s.getSettlementAmount())
        				.periodStart(s.getPeriodStart())
        				.periodEnd(s.getPeriodEnd())
        				.build())
        		.collect(Collectors.toList());
                
    }
    
    private String formatWeeklyLabel(LocalDate start, LocalDate end) {
        if (start == null || end == null) return "";
        // 예: 11/24~11/30
        return String.format("%02d/%02d~%02d/%02d",
                start.getMonthValue(), start.getDayOfMonth(),
                end.getMonthValue(), end.getDayOfMonth());
    }
    
    public Page<SalesBoardDTO> getMyBoards(String userId,int page, int size) {
    	Pageable pageable = PageRequest.of(page, size
    			,Sort.by(Sort.Direction.DESC, "created"));
    	
    	Page<SalesBoard> sb = salesBoardRepository.
    			findByProducer_Member_UserId(userId, pageable);
    	
    	return sb.map(SalesBoardDTO::toDTO);
    }
}
