import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Users,
  Plus,
  Zap,
  Target,
  TrendingUp,
  Star,
  ArrowRight,
  ExternalLink,
  Youtube,
  PlayCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/button/Button';
// import Badge from '../../components/ui/badge/Badge'; // Unused

import useJobStore from '../../stores/useJobStore';
import useTemplateStore from '../../stores/useTemplateStore';
import useAuthStore from '../../stores/useAuthStore';
import usePlanLimits from '../../hooks/usePlanLimits';

// Components
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";

const Home = () => {
  const { fetchActiveJobs } = useJobStore();
  const { templates, fetchTemplates } = useTemplateStore();
  const { refreshUser } = useAuthStore();
  const { planLimits } = usePlanLimits();
  const { user } = useAuthStore();

  // Local state
  const [platformConnections, setPlatformConnections] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [isLoadingAutomations, setIsLoadingAutomations] = useState(true);

  const fetchPlatformConnections = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${apiUrl}/api/users/platforms`, {
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${apiUrl}/api/automation`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAutomations(data.data.automations || []);
      } else {
        console.error('Failed to fetch automations');
      }
    } catch (error) {
      console.error('Error fetching automations:', error);
    } finally {
      setIsLoadingAutomations(false);
    }
  };

  useEffect(() => {
    refreshUser();
    fetchActiveJobs();
    fetchTemplates();
    fetchPlatformConnections();
    fetchAutomations();
  }, [fetchActiveJobs, fetchTemplates]);

  // Platform connection status
  const getPlatformStatus = (platform: string) => {
    const connection = platformConnections.find(
      (p: any) => p.platform.toLowerCase() === platform.toLowerCase()
    );
    return connection && connection.isActive ? 'connected' : 'disconnected';
  };

  // Get template display name by templateId
  const getTemplateName = (templateId: string) => {
    const template = templates.find((t: any) => t.id === templateId);
    return template?.displayName || templateId || 'Unknown Template';
  };

  // Filter out duplicate automations
  const getUniqueAutomations = (automations: any[]) => {
    const grouped: any = {};

    automations.forEach(auto => {
      const key = `${auto.templateId}-${JSON.stringify(auto.config)}`;

      if (
        !grouped[key] ||
        new Date(auto.createdAt) > new Date(grouped[key].createdAt)
      ) {
        grouped[key] = auto;
      }
    });

    return Object.values(grouped);
  };

  // Get unique automations
  const uniqueAutomations = getUniqueAutomations(automations);

  // Create mock chart data based on automations count
  const baseCount = uniqueAutomations.length;
  // This mock data creates a realistic-looking curve that ends near the current user's count
  const chartData = [
    Math.max(0, baseCount - 5),
    Math.max(0, baseCount - 2),
    Math.max(0, baseCount - 8),
    Math.max(0, baseCount - 3),
    Math.max(1, baseCount),
    Math.max(2, baseCount + 2),
    Math.max(1, baseCount + 1),
    Math.max(3, baseCount + 4),
    Math.max(2, baseCount + 2),
    Math.max(5, baseCount + 6),
    Math.max(4, baseCount + 5),
    Math.max(baseCount + 1, 6)
  ];

  // Onboarding videos
  const onboardingVideos = [
    {
      title: 'Getting Started with Trobyx',
      description: 'Learn the basics of LinkedIn automation',
      duration: '3:45',
      thumbnail: '/video-thumbnails/getting-started.jpg',
      url: 'https://docs.trobyx.com/getting-started',
      isActive: true,
    },
    {
      title: 'LinkedIn Connection Setup',
      description: 'How to connect your LinkedIn account safely',
      duration: '5:20',
      thumbnail: '/video-thumbnails/linkedin-setup.jpg',
      url: 'https://docs.trobyx.com/linkedin-setup',
      isActive: getPlatformStatus('linkedin') === 'disconnected',
    },
    {
      title: 'Your First Automation',
      description: 'Create and run your first LinkedIn automation',
      duration: '4:15',
      thumbnail: '/video-thumbnails/first-automation.jpg',
      url: 'https://docs.trobyx.com/first-automation',
      isActive: (uniqueAutomations.length || 0) === 0,
    },
  ].filter(video => video.isActive);

  // Get recent automations (both active and recently completed)
  const recentAutomations: any[] = [...uniqueAutomations]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Determine user onboarding state
  const isNewUser = uniqueAutomations.length === 0;
  const hasConnectedPlatforms =
    getPlatformStatus('linkedin') === 'connected' ||
    getPlatformStatus('twitter') === 'connected';
  const completedAutomations = uniqueAutomations.filter(
    (a: any) => a.status === 'completed'
  ).length;

  return (
    <>
      <PageMeta
        title="Trobyx Dashboard | Automate Your Social Growth"
        description="Monitor your automation workflows, manage templates, and track performance on your Trobyx Dashboard."
      />
      <div className='min-h-screen pt-4 px-4'>
        <div className='max-w-7xl mx-auto'>
          {/* Enhanced Header with Welcome */}
          <div className='mb-8'>
            <div className='flex flex-col lg:flex-row lg:items-top justify-between gap-6'>
              <div>
                <h1 className='text-3xl font-black text-black flex items-center gap-3 dark:text-white'>
                  {isNewUser ? 'Welcome to Trobyx!' : 'Welcome Back!'}
                </h1>
                <p className='text-gray-600 mt-2 text-lg font-medium dark:text-gray-400'>
                  {isNewUser
                    ? "Let's get you started with social media automation"
                    : 'Manage and monitor your automation workflows'}
                </p>
              </div>
              <div className='flex gap-3'>
                <Link to='/trobs'>
                  <Button startIcon={<Plus size={18} />} size='sm'>
                    New Automation
                  </Button>
                </Link>

              </div>
            </div>
          </div>

          {/* Stats Overview Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <Card>
              <div className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm font-medium dark:text-gray-400'>
                      Completed Automations
                    </p>
                    <p className='text-2xl font-bold text-black mt-1 dark:text-white'>
                      {completedAutomations}
                    </p>
                  </div>
                  <CheckCircle className='w-8 h-8 text-green-500' />
                </div>
              </div>
            </Card>

            <Card>
              <div className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm font-medium dark:text-gray-400'>
                      Trob Templates
                    </p>
                    <p className='text-2xl font-bold text-black mt-1 dark:text-white'>
                      {templates.length}
                    </p>
                  </div>
                  <FileText className='w-8 h-8 text-blue-500' />
                </div>
              </div>
            </Card>

            <div
              className={`relative ${user?.onboardingStep === 3 ? "z-50" : ""}`}
            >
              {user?.onboardingStep === 3 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-[9999] whitespace-nowrap animate-fade-in-up">
                  <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-[11px] font-bold py-2.5 px-4 rounded-xl shadow-2xl border border-blue-200 dark:border-gray-700 flex items-center gap-4 relative">
                    <span>Here is status of your connected account</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        useAuthStore.getState().updateOnboarding(4);
                      }}
                      className="bg-brand-500 text-white px-2 py-1 rounded-md text-[10px] font-bold hover:bg-brand-600 transition-colors shadow-sm cursor-pointer"
                    >
                      OK
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-blue-200 dark:border-gray-700 rotate-45 -mt-1.5"></div>
                  </div>
                </div>
              )}
              <Card>
                <div className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-gray-600 text-sm font-medium dark:text-gray-400'>
                        Connected Accounts
                      </p>
                      <p className='text-2xl font-bold text-black mt-1 dark:text-white'>
                        {(getPlatformStatus('linkedin') === 'connected' ? 1 : 0) +
                          (getPlatformStatus('twitter') === 'connected' ? 1 : 0)}
                      </p>
                    </div>
                    <Users className='w-8 h-8 text-indigo-500' />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
            {/* Left Column - Main Content */}
            <div className='xl:col-span-2 space-y-8'>
              {/* Quick Start / Onboarding */}
              {isNewUser && (
                <Card className='bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 border border-blue-200 dark:from-blue-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800'>
                  <div className='p-8'>
                    <div className='flex items-start gap-4'>
                      <div className='w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0'>
                        <Target className='w-6 h-6 text-white' />
                      </div>
                      <div className='flex-1'>
                        <h3 className='text-xl font-bold text-black mb-3 dark:text-white'>
                          Get Started in 3 Steps
                        </h3>
                        <div className='space-y-4'>
                          <div className='flex items-center gap-4'>
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${hasConnectedPlatforms
                                ? 'bg-green-500 text-white'
                                : 'bg-blue-500 text-white'
                                }`}
                            >
                              {hasConnectedPlatforms ? '✓' : '1'}
                            </div>
                            <div className='flex-1'>
                              <h4 className='font-semibold text-black dark:text-white'>
                                Connect Your Platform
                              </h4>
                              <p className='text-gray-600 text-sm dark:text-gray-400'>
                                Link your LinkedIn or Twitter account
                              </p>
                            </div>
                            {!hasConnectedPlatforms && (
                              <Link to='/platforms'>
                                <Button size='sm'>Connect</Button>
                              </Link>
                            )}
                          </div>

                          <div className='flex items-center gap-4'>
                            <div className='w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold dark:bg-gray-700 dark:text-gray-300'>
                              2
                            </div>
                            <div className='flex-1'>
                              <h4 className='font-semibold text-black dark:text-white'>
                                Choose Template
                              </h4>
                              <p className='text-gray-600 text-sm dark:text-gray-400'>
                                Pick from {templates.length} automation templates
                              </p>
                            </div>
                            <Link to='/trobs'>
                              <Button size='sm' variant='outline'>
                                Browse
                              </Button>
                            </Link>
                          </div>

                          <div className='flex items-center gap-4'>
                            <div className='w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold dark:bg-gray-700 dark:text-gray-300'>
                              3
                            </div>
                            <div className='flex-1'>
                              <h4 className='font-semibold text-black dark:text-white'>
                                Start Automating
                              </h4>
                              <p className='text-gray-600 text-sm dark:text-gray-400'>
                                Configure and launch your first automation
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Automations Overview */}
              <Card>
                <Card.Header>
                  <div className='flex items-center justify-between'>
                    <Card.Title className='text-xl font-bold'>
                      Your Automations
                    </Card.Title>
                    <Link to='/automations'>

                    </Link>
                  </div>
                </Card.Header>
                <Card.Content>
                  {recentAutomations.length > 0 ? (
                    <div className='space-y-4'>
                      {recentAutomations.map((automation: any) => (
                        <div
                          key={automation.id}
                          className='border rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700'
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4 min-w-0 flex-1 mr-4'>
                              <span
                                className={`inline-flex flex-shrink-0 items-center px-2 py-0.5 rounded-full text-xs font-medium border ${automation.status === 'active'
                                  ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                  : automation.status === 'completed'
                                    ? 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800'
                                    : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                  }`}
                              >
                                <span
                                  className={`w-2 h-2 mr-1 rounded-full bg-gradient-to-r ${automation.status === 'active'
                                    ? 'from-green-400 to-green-600 animate-pulse'
                                    : automation.status === 'completed'
                                      ? 'from-indigo-400 to-indigo-600'
                                      : 'from-gray-400 to-gray-600'
                                    }`}
                                ></span>
                                {automation.status === 'active'
                                  ? 'Active'
                                  : automation.status === 'completed'
                                    ? 'Completed'
                                    : 'Inactive'}
                              </span>

                              <div className='min-w-0 flex-1'>
                                <h4 className='font-semibold text-black dark:text-white truncate'>
                                  {getTemplateName(automation.templateId)}
                                </h4>
                                <div className='flex items-center gap-4 text-sm text-gray-600 mt-1 dark:text-gray-400'>
                                  <span>
                                    Created:{' '}
                                    {new Date(
                                      automation.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className='flex items-center gap-3 flex-shrink-0'>
                              <Link to={`/automations/${automation.id}`}>
                                <Button size='sm' variant='outline' endIcon={<ArrowRight className='w-4 h-4' />}>
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>

                          {automation.status === 'active' && (
                            <div className='mt-4'>
                              <div className='flex items-center justify-between text-xs text-gray-600 mb-2 dark:text-gray-400'>
                                <span>Running</span>
                                <span>Active</span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700'>
                                <div className='bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-full relative overflow-hidden'>
                                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse'></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-12'>
                      <div className='w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:from-blue-900/20 dark:to-indigo-900/20'>
                        <Zap className='w-8 h-8 text-blue-500' />
                      </div>
                      <h3 className='text-lg font-semibold text-black mb-2 dark:text-white'>
                        Ready to automate?
                      </h3>
                      <p className='text-gray-600 mb-6 max-w-md mx-auto dark:text-gray-400'>
                        Choose from our library of automation templates to start
                        growing your social media presence.
                      </p>
                      <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                        <Link to='/trobs'>
                          <Button className='w-full sm:w-auto' startIcon={<Star className='w-4 h-4' />}>
                            Browse Templates
                          </Button>
                        </Link>
                        <Link to='/platforms'>
                          <Button variant='outline' className='w-full sm:w-auto' startIcon={<Users className='w-4 h-4' />}>
                            Connect Platforms
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </Card.Content>
              </Card>

              {/* Statistics Chart */}
              <StatisticsChart data={chartData} title="Automation Activity" />

              {/* Recent Automations Table */}
              <RecentOrders automations={recentAutomations} />

            </div>

            {/* Right Column - Platforms & Resources */}
            <div className='xl:col-span-1 space-y-6'>

              {/* Tutorial Videos - Moved Above Targets as requested */}
              <Card>
                <Card.Header>
                  <Card.Title className='text-lg font-bold flex items-center gap-2'>
                    <Youtube className='w-5 h-5 text-red-500' />
                    Quick Tutorials
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className='space-y-3'>
                    {onboardingVideos.slice(0, 3).map((video, index) => (
                      <a
                        key={index}
                        href={video.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='group flex gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-blue-100 transition-all dark:hover:bg-gray-800 dark:hover:border-gray-700'
                      >
                        <div className='w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0'>
                          <Youtube className='w-5 h-5 text-white group-hover:scale-110 transition-transform' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h4 className='font-medium text-black group-hover:text-blue-600 text-sm dark:text-white dark:group-hover:text-blue-400'>
                            {video.title}
                          </h4>
                          <p className='text-xs text-gray-600 mt-1 dark:text-gray-400'>
                            {video.duration} • {video.description}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className='mt-4 pt-4 border-t dark:border-gray-800'>
                    <Link to='https://trobyx.com/help' target='_blank'>
                      <Button variant='outline' size='sm' className='w-full' startIcon={<ExternalLink className='w-4 h-4' />}>
                        View All Resources
                      </Button>
                    </Link>
                  </div>
                </Card.Content>
              </Card>

              {/* Monthly Target with Useful Dynamic Data */}
              <MonthlyTarget
                current={uniqueAutomations.length}
                max={planLimits.maxConcurrentAutomations + 20}
                title="Plan Usage"
              />

              {/* Popular Templates */}
              <Card>
                <Card.Header>
                  <Card.Title className='text-lg font-bold flex items-center gap-2'>
                    <TrendingUp className='w-5 h-5 text-blue-500' />
                    Popular Trob Templates
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className='space-y-3'>
                    {templates.slice(0, 4).map((template: any, index: number) => (
                      <Link
                        key={template.id}
                        to={`/trobs/${template.id}`}
                        className='group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-blue-100 transition-all dark:hover:bg-gray-800 dark:hover:border-gray-700'
                      >
                        <div className='flex items-center gap-3 min-w-0 flex-1 mr-2'>
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${index === 0
                              ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                              : index === 1
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                : index === 2
                                  ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                                  : 'bg-gradient-to-br from-green-500 to-emerald-600'
                              }`}
                          >
                            {index + 1}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='font-medium text-black group-hover:text-blue-600 text-sm truncate dark:text-white dark:group-hover:text-blue-400'>
                              {template.displayName}
                            </p>
                            <p className='text-xs text-gray-600 capitalize dark:text-gray-400 truncate'>
                              {template.platform}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className='w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0' />
                      </Link>
                    ))}
                  </div>
                  <div className='mt-4 pt-4 border-t dark:border-gray-800'>
                    <Link to='/trobs'>
                      <Button variant='outline' size='sm' className='w-full' startIcon={<FileText className='w-4 h-4' />}>
                        Browse All Templates
                      </Button>
                    </Link>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
