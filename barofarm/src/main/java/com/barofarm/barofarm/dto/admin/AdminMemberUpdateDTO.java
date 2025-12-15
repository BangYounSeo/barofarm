// com.barofarm.barofarm.dto.member.AdminMemberUpdateDTO
package com.barofarm.barofarm.dto.admin;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminMemberUpdateDTO {

    private String name;
    private String phone;
    private String email;

    // 새 비밀번호 (비워두면 변경 X)
    private String password;

    // 🔹 추가: 권한, 상태
    // 예) "ROLE_USER", "ROLE_ADMIN", "ROLE_PRODUCER"
    private String role;

    // 예) "ACTIVE", "WITHDRAW", "BLOCKED"
    private String status;
}
