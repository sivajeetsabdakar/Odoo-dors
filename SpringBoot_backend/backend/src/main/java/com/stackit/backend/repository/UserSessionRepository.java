package com.stackit.backend.repository;

import com.stackit.backend.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    List<UserSession> findByUserId(Long userId);

    List<UserSession> findByUserIdAndDeviceType(Long userId, UserSession.DeviceType deviceType);

    void deleteByDeviceToken(String deviceToken);
}