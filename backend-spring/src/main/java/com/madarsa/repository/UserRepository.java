package com.madarsa.repository;

import com.madarsa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByMobile(String mobile);

    Optional<User> findByEmailOrMobile(String email, String mobile);

    boolean existsByEmail(String email);

    boolean existsByMobile(String mobile);

    List<User> findByUserType(String userType);

    List<User> findByApprovalStatus(String approvalStatus);

    List<User> findByUserTypeAndApprovalStatus(String userType, String approvalStatus);

    long countByUserType(String userType);

    long countByApprovalStatus(String approvalStatus);

    long countByUserTypeAndApprovalStatus(String userType, String approvalStatus);
}

