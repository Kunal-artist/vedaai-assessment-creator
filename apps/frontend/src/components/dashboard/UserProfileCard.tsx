"use client";

export default function UserProfileCard() {
  return (
    <div className="sidebar-footer">
      <img src="/avatar.png" alt="User" width={32} height={32} className="sidebar-footer-avatar-img" />
      <div className="sidebar-footer-info">
        <div className="sidebar-footer-name">Delhi Public School</div>
        <div className="sidebar-footer-sub">Bokaro Steel City</div>
      </div>
    </div>
  );
}
