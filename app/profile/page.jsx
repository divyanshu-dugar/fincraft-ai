'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  LogOut,
  ChevronRight,
  Edit3,
  Save,
  X,
} from 'lucide-react';
import { getToken, readToken, removeToken } from '@/lib/authenticate';

const AUTH_SCHEME = 'jwt';
const API = process.env.NEXT_PUBLIC_API_URL;

/* ─── small helpers ─────────────────────────────────────── */
function Toast({ type, message, onDismiss }) {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg ${
        isSuccess
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          : 'bg-red-500/10 border-red-500/30 text-red-400'
      }`}
    >
      {isSuccess ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function SectionCard({ icon: Icon, title, subtitle, children, accent = 'cyan' }) {
  const accentMap = {
    cyan: 'from-cyan-500 to-blue-600',
    purple: 'from-purple-500 to-indigo-600',
    rose: 'from-rose-500 to-red-600',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-white/5 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentMap[accent]} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-6">{children}</div>
    </motion.div>
  );
}

function InputField({ label, icon: Icon, type = 'text', value, onChange, placeholder, disabled, readOnly, rightElement }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <input
          type={type}
          value={value ?? ''}
          onChange={onChange ?? (() => {})}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all outline-none
            ${readOnly || disabled
              ? 'bg-slate-800/40 border-white/5 text-slate-400 cursor-not-allowed'
              : 'bg-slate-800/60 border-white/10 text-white placeholder-slate-500 focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20'
            }
            ${rightElement ? 'pr-10' : ''}
          `}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">{rightElement}</div>
        )}
      </div>
    </div>
  );
}

function PasswordInput({ label, icon: Icon, value, onChange, placeholder, disabled }) {
  const [show, setShow] = useState(false);
  return (
    <InputField
      label={label}
      icon={Icon}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rightElement={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
}

function SubmitButton({ loading, label, loadingLabel, disabled }) {
  return (
    <motion.button
      type="submit"
      disabled={loading || disabled}
      whileHover={!loading && !disabled ? { scale: 1.01 } : {}}
      whileTap={!loading && !disabled ? { scale: 0.99 } : {}}
      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-cyan-500/20"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </motion.button>
  );
}

/* ─── main page ─────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter();
  const tokenUser = readToken();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileToast, setProfileToast] = useState({ type: '', message: '' });

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordToast, setPasswordToast] = useState({ type: '', message: '' });

  // Delete account state
  const [deleteExpanded, setDeleteExpanded] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteToast, setDeleteToast] = useState({ type: '', message: '' });

  const authHeader = useCallback(() => ({
    Authorization: `${AUTH_SCHEME} ${getToken()}`,
    'Content-Type': 'application/json',
  }), []);

  // Fetch profile
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/profile`, { headers: authHeader() });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProfile(data);
        setUserName(data.userName);
        setEmail(data.email);
      } catch {
        setProfileToast({ type: 'error', message: 'Failed to load profile. Please refresh.' });
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [authHeader]);

  // ── Update profile ──────────────────────────────────────
  async function handleUpdateProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileToast({ type: '', message: '' });
    try {
      const body = {};
      if (userName !== profile.userName) body.userName = userName;
      if (email !== profile.email) body.email = email;

      if (!Object.keys(body).length) {
        setProfileToast({ type: 'error', message: 'No changes detected.' });
        return;
      }

      const res = await fetch(`${API}/api/profile`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setProfile(data.user);
      setEditing(false);
      setProfileToast({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setProfileToast({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  }

  function cancelEdit() {
    setUserName(profile?.userName || '');
    setEmail(profile?.email || '');
    setEditing(false);
    setProfileToast({ type: '', message: '' });
  }

  // ── Change password ─────────────────────────────────────
  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordToast({ type: '', message: '' });

    if (newPassword !== confirmPassword) {
      setPasswordToast({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordToast({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch(`${API}/api/profile/change-password`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordToast({ type: 'success', message: 'Password changed successfully.' });
    } catch (err) {
      setPasswordToast({ type: 'error', message: err.message || 'Failed to change password.' });
    } finally {
      setSavingPassword(false);
    }
  }

  // ── Delete account ──────────────────────────────────────
  async function handleDeleteAccount(e) {
    e.preventDefault();
    setDeleteToast({ type: '', message: '' });

    if (deleteConfirm !== 'DELETE') {
      setDeleteToast({ type: 'error', message: 'Type DELETE to confirm account deletion.' });
      return;
    }

    setDeletingAccount(true);
    try {
      const res = await fetch(`${API}/api/profile`, {
        method: 'DELETE',
        headers: authHeader(),
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      removeToken();
      router.replace('/');
    } catch (err) {
      setDeleteToast({ type: 'error', message: err.message || 'Failed to delete account.' });
      setDeletingAccount(false);
    }
  }

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const initials = (profile?.userName || tokenUser?.userName || 'U')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/6 to-blue-600/6 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/6 to-indigo-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-6">

        {/* ── Hero header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5"
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20">
              <span className="text-2xl font-black text-white">{initials}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">
              {profile?.userName || tokenUser?.userName}
            </h1>
            <p className="text-sm text-slate-400 truncate">{profile?.email}</p>
            {memberSince && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-500">Member since {memberSince}</span>
              </div>
            )}
          </div>

          <div className="ml-auto shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Shield className="w-3 h-3" />
              {profile?.role === 'admin' ? 'Admin' : 'Member'}
            </span>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">

          {/* ── Profile Info ── */}
          <SectionCard icon={User} title="Profile Information" subtitle="Update your public display name and email address">
            <AnimatePresence mode="wait">
              {profileToast.message && (
                <motion.div key="profile-toast" className="mb-4">
                  <Toast
                    type={profileToast.type}
                    message={profileToast.message}
                    onDismiss={() => setProfileToast({ type: '', message: '' })}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Username"
                  icon={User}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your username"
                  readOnly={!editing}
                />
                <InputField
                  label="Email address"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  readOnly={!editing}
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                {editing ? (
                  <>
                    <SubmitButton
                      loading={savingProfile}
                      label={<><Save className="w-4 h-4" /> Save Changes</>}
                      loadingLabel="Saving…"
                    />
                    <motion.button
                      type="button"
                      onClick={cancelEdit}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-sm font-medium transition-all"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    type="button"
                    onClick={() => setEditing(true)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 text-sm font-medium transition-all"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Profile
                  </motion.button>
                )}
              </div>
            </form>
          </SectionCard>

          {/* ── Change Password ── */}
          <SectionCard icon={Lock} title="Change Password" subtitle="Use a strong password you don't use elsewhere" accent="purple">
            <AnimatePresence mode="wait">
              {passwordToast.message && (
                <motion.div key="pw-toast" className="mb-4">
                  <Toast
                    type={passwordToast.type}
                    message={passwordToast.message}
                    onDismiss={() => setPasswordToast({ type: '', message: '' })}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <PasswordInput
                label="Current Password"
                icon={Lock}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                disabled={savingPassword}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PasswordInput
                  label="New Password"
                  icon={Shield}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  disabled={savingPassword}
                />
                <PasswordInput
                  label="Confirm New Password"
                  icon={Shield}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  disabled={savingPassword}
                />
              </div>

              {/* Password strength hint */}
              {newPassword.length > 0 && (
                <div className="flex items-center gap-2">
                  {[...Array(4)].map((_, i) => {
                    const strength = Math.min(Math.floor(newPassword.length / 3), 4);
                    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
                    return (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i < strength ? colors[strength - 1] : 'bg-slate-700'}`}
                      />
                    );
                  })}
                  <span className="text-xs text-slate-500 w-16 text-right">
                    {['', 'Weak', 'Fair', 'Good', 'Strong'][Math.min(Math.floor(newPassword.length / 3), 4)]}
                  </span>
                </div>
              )}

              <SubmitButton
                loading={savingPassword}
                label={<><Lock className="w-4 h-4" /> Update Password</>}
                loadingLabel="Updating…"
                disabled={!currentPassword || !newPassword || !confirmPassword}
              />
            </form>
          </SectionCard>

          {/* ── Danger Zone ── */}
          <SectionCard icon={Trash2} title="Danger Zone" subtitle="These actions are permanent and cannot be undone" accent="rose">
            <AnimatePresence mode="wait">
              {deleteToast.message && (
                <motion.div key="del-toast" className="mb-4">
                  <Toast
                    type={deleteToast.type}
                    message={deleteToast.message}
                    onDismiss={() => setDeleteToast({ type: '', message: '' })}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {/* Expand toggle */}
              <button
                type="button"
                onClick={() => {
                  setDeleteExpanded((v) => !v);
                  setDeleteToast({ type: '', message: '' });
                  setDeletePassword('');
                  setDeleteConfirm('');
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-sm font-medium transition-all"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete My Account
                </div>
                <motion.div animate={{ rotate: deleteExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence>
                {deleteExpanded && (
                  <motion.form
                    onSubmit={handleDeleteAccount}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pt-2">
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 text-xs text-red-300 leading-relaxed">
                        <strong className="block text-red-400 mb-1">This will permanently delete:</strong>
                        All your expenses, income records, budgets, savings goals, AI chat history, and your account. This cannot be reversed.
                      </div>

                      <PasswordInput
                        label="Confirm with your password"
                        icon={Lock}
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Enter your password"
                        disabled={deletingAccount}
                      />

                      <InputField
                        label='Type "DELETE" to confirm'
                        icon={AlertCircle}
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder="DELETE"
                        disabled={deletingAccount}
                      />

                      <motion.button
                        type="submit"
                        disabled={deletingAccount || deleteConfirm !== 'DELETE' || !deletePassword}
                        whileHover={!deletingAccount ? { scale: 1.01 } : {}}
                        whileTap={!deletingAccount ? { scale: 0.99 } : {}}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {deletingAccount ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Deleting account…</>
                        ) : (
                          <><Trash2 className="w-4 h-4" /> Permanently Delete Account</>
                        )}
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </SectionCard>

        </motion.div>
      </div>
    </div>
  );
}
