import React, { useEffect, useState } from 'react';
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import useJobStore from '../../stores/useJobStore';
import useTemplateStore from '../../stores/useTemplateStore';
import usePlanLimits from '../../hooks/usePlanLimits';
import useAuthStore from '../../stores/useAuthStore';
import { usePlatformConnection } from '../../hooks/usePlatformConnection';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Home() {
  const { activeJobs, fetchActiveJobs } = useJobStore();
  const { templates, fetchTemplates } = useTemplateStore();
  const { user, refreshUser } = useAuthStore();
  // const {
  //   planLimits,
  //   checkAutomationLimit,
  //   checkProfileLimit,
  //   trialDaysRemaining,
  //   currentPlan,
  // } = usePlanLimits();

  // Platform connections hooks
  const { isConnected: isLinkedinConnected } = usePlatformConnection('linkedin');
  const { isConnected: isTwitterConnected } = usePlatformConnection('twitter');

  const [dashboardStats, setDashboardStats] = useState(null);
  const [automations, setAutomations] = useState<any[]>([]);
  const [platformConnections, setPlatformConnections] = useState<any[]>([]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/jobs/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchPlatformConnections = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/users/platforms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPlatformConnections(data.data.platforms || []);
      }
    } catch (error) {
      console.error('Error fetching platform connections:', error);
    }
  };

  const fetchAutomations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/automation`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAutomations(data.data.automations || []);
      }
    } catch (error) {
      console.error('Error fetching automations:', error);
    }
  };

  useEffect(() => {
    refreshUser();
    fetchActiveJobs();
    fetchTemplates();
    fetchDashboardStats();
    fetchPlatformConnections();
    fetchAutomations();
  }, [fetchActiveJobs, fetchTemplates]);

  // Calculate stats
  // Filter out duplicate automations logic from user request
  const getUniqueAutomations = (automations: any[]) => {
    const grouped: any = {};
    automations.forEach(auto => {
      const key = `${auto.templateId}-${JSON.stringify(auto.config)}`;
      if (!grouped[key] || new Date(auto.createdAt) > new Date(grouped[key].createdAt)) {
        grouped[key] = auto;
      }
    });
    return Object.values(grouped);
  };

  const uniqueAutomations = getUniqueAutomations(automations);
  const activeAutomationsCount = uniqueAutomations.filter((a: any) => a.status === 'active').length;

  // Connected accounts count - use the platforms data from API
  const connectedAccountsCount = platformConnections.filter(
    (p: any) => p.isActive
  ).length;


  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics
            subscribers={connectedAccountsCount}
            activeAutomations={activeAutomationsCount}
          />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
