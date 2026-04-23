"use client";

import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { getToken } from "@/lib/authenticate";
import {
  calculateMonthlySavings,
  calculateYearlySavings,
  calculateDailySavings,
} from "@/lib/goalsUtils";

import GoalsHeader from "@/components/goals/GoalsHeader";
import GoalGrid from "@/components/goals/GoalGrid";
import GoalFormModal from "@/components/goals/GoalFormModal";
import ConfirmDeleteModal from "@/components/goals/ConfirmDeleteModal";
import LoadingSkeleton from "@/components/goals/LoadingSkeleton";

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    deadline: "",
    priority: "medium",
    description: "",
  });
  const [editingGoal, setEditingGoal] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/saving-goals`,
        {
          headers: { Authorization: `jwt ${token}` },
        }
      );
      if (res.ok) {
        setGoals(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Local input update (only state)
  const handleChangeSavedAmount = (id, newValue) => {
    setGoals((prev) =>
      prev.map((g) =>
        g._id === id ? { ...g, savedAmount: parseFloat(newValue) || 0 } : g
      )
    );
  };

  // Save update to backend
  const handleUpdateSavedAmount = async (id, savedAmount) => {
    try {
      const token = getToken();
      const numAmount = parseFloat(savedAmount);
      
      if (isNaN(numAmount) || numAmount < 0) {
        console.error("Invalid amount:", savedAmount);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/saving-goals/${id}/save`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `jwt ${token}`,
          },
          body: JSON.stringify({ savedAmount: numAmount }),
        }
      );
      
      if (res.ok) {
        await fetchGoals(); // refresh data
        toast.success('Saved amount updated!');
      } else {
        const error = await res.json();
        console.error("Failed to update saved amount:", error);
        toast.error('Failed to update saved amount.');
      }
    } catch (err) {
      console.error("Error updating saved amount:", err);
      toast.error('Failed to update saved amount.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    const payload = { ...formData, amount: parseFloat(formData.amount) };
    const url = editingGoal
      ? `${process.env.NEXT_PUBLIC_API_URL}/saving-goals/${editingGoal._id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/saving-goals`;
    const method = editingGoal ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `jwt ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || d.message || 'Failed to save goal');
      return;
    }
    toast.success(editingGoal ? 'Goal updated!' : 'Goal created!');
    fetchGoals();
    resetForm();
  };

  const deleteGoal = async (id) => {
    const token = getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saving-goals/${id}`, {
      method: "DELETE",
      headers: { Authorization: `jwt ${token}` },
    });
    if (res.ok) {
      toast.success('Goal deleted.');
      setGoals(goals.filter((g) => g._id !== id));
    } else {
      toast.error('Failed to delete goal.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      deadline: "",
      priority: "medium",
      description: "",
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  // helpers
  const normalizeDateOnlyToUtc = (value) => {
    if (!value) return null;
    const dateOnly = String(value).split("T")[0];
    const [year, month, day] = dateOnly.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(Date.UTC(year, month - 1, day));
  };

  const formatCurrency = (a) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(a);

  const formatDate = (d) => {
    const normalizedDate = normalizeDateOnlyToUtc(d);
    if (!normalizedDate) return "Invalid date";

    return normalizedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const getDaysRemaining = (d) => {
    const deadlineUtc = normalizeDateOnlyToUtc(d);
    if (!deadlineUtc) return 0;

    const now = new Date();
    const todayUtc = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    );

    return Math.ceil((deadlineUtc - todayUtc) / (1000 * 60 * 60 * 24));
  };

  const getPriorityColor = (p) =>
    p === "high"
      ? "from-red-500 to-pink-600"
      : p === "medium"
      ? "from-yellow-500 to-orange-500"
      : "from-green-500 to-emerald-600";

  const getPriorityIcon = (p) =>
    p === "high" ? "🔥" : p === "medium" ? "⚡" : "🌱";

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-950 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <GoalsHeader onNewGoal={() => setShowForm(true)} />

        <GoalGrid
          goals={goals}
          onCreateGoal={() => setShowForm(true)}
          onEdit={(g) => {
            setEditingGoal(g);
            setFormData({
              name: g.name,
              amount: g.amount,
              deadline: g.deadline?.split("T")[0],
              priority: g.priority,
              description: g.description,
            });
            setShowForm(true);
          }}
          onDelete={(id) => setConfirmDeleteId(id)}
          onChangeSavedAmount={handleChangeSavedAmount}
          onUpdateSavedAmount={handleUpdateSavedAmount}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getDaysRemaining={getDaysRemaining}
          getPriorityColor={getPriorityColor}
          getPriorityIcon={getPriorityIcon}
        />

        {showForm && (
          <GoalFormModal
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            editing={!!editingGoal}
          />
        )}

        {confirmDeleteId && (
          <ConfirmDeleteModal
            onCancel={() => setConfirmDeleteId(null)}
            onConfirm={() => {
              deleteGoal(confirmDeleteId);
              setConfirmDeleteId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
