"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/authenticate";

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/saving-goals/${id}/save`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `jwt ${token}`,
          },
          body: JSON.stringify({ savedAmount: parseFloat(savedAmount) }),
        }
      );
      if (res.ok) {
        await fetchGoals(); // refresh data
      }
    } catch (err) {
      console.error("Error updating saved amount:", err);
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

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `jwt ${token}`,
      },
      body: JSON.stringify(payload),
    });

    fetchGoals();
    resetForm();
  };

  const deleteGoal = async (id) => {
    const token = getToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saving-goals/${id}`, {
      method: "DELETE",
      headers: { Authorization: `jwt ${token}` },
    });
    setGoals(goals.filter((g) => g._id !== id));
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
  const formatCurrency = (a) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(a);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getDaysRemaining = (d) =>
    Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 py-18 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <GoalsHeader onNewGoal={() => setShowForm(true)} />

        <GoalGrid
          goals={goals}
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
