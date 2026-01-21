import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Users,
    Search,
    Filter,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Heart,
    MessageSquare,
    UserPlus,
    UserCheck,
    Calendar,
    Clock,
    Star,
    MapPin,
    Building,
    Award,
    TrendingUp,
    BarChart3,
    Eye,
    ThumbsUp,
    MessageCircle,
    RefreshCw,
    Loader2,
    AlertCircle,
    Sparkles,
    UserX
} from 'lucide-react';
import { getFlow, getFlowProspects } from '../../api/flows';
import Flowbtn from '../../components/ui/flowbtns/Flowbtn';

import { toast } from 'react-hot-toast';

// Type definitions
interface Flow {
    _id?: string;
    name: string;
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED' | string;
    nextScheduledRun?: string;
    [key: string]: any;
}

interface Activity {
    message?: string;
    description?: string;
    timestamp: string;
    [key: string]: any;
}

interface Engagement {
    type: 'POST_LIKED' | 'POST_COMMENTED' | string;
    timestamp: string;
    postText?: string;
    comment?: string;
    postUrl?: string;
    [key: string]: any;
}

interface Connection {
    sentAt: string;
    message?: string;
    acceptedAt?: string;
    declinedAt?: string;
    [key: string]: any;
}

interface Post {
    type?: string;
    timestamp: string;
    content?: string;
    postText?: string;
    url?: string;
    engagement?: {
        liked?: boolean;
        commented?: boolean;
    };
    metrics?: {
        likesCount?: number;
        commentsCount?: number;
    };
    [key: string]: any;
}

interface Prospect {
    id: string;
    name?: string;
    title?: string;
    company?: string;
    location?: string;
    profileImage?: string;
    aiScore?: number;
    matchQuality?: string;
    matchReason?: string;
    relevanceFactors?: string[] | Record<string, any>;
    connection?: Connection;
    engagements?: Engagement[];
    recentPosts?: Post[];
    profileUrl?: string;
    [key: string]: any;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    [key: string]: any;
}

interface ApiResponse<T> {
    status: 'success' | 'error';
    data: {
        flow?: T;
        prospects?: T[];
        pagination?: Pagination;
    };
    [key: string]: any;
}

interface Filters {
    page: number;
    limit: number;
    status: string;
    search: string;
    aiScore?: string;
}

const FlowProspects: React.FC = () => {
    const { flowId } = useParams<{ flowId: string }>();
    const navigate = useNavigate();
    const [flow, setFlow] = useState<Flow | null>(null);
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [filters, setFilters] = useState<Filters>({
        page: 1,
        limit: 20,
        status: '',
        search: ''
    });
    const [expandedProspect, setExpandedProspect] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    useEffect(() => {
        fetchFlow();
        fetchProspects();
    }, [flowId]);

    const fetchFlow = async () => {
        if (!flowId) return;

        try {
            const response = await getFlow(flowId);

            if (response && response.status === 'success') {
                const flowData = (response.data as any).flow || null;
                setFlow(flowData);
            }
        } catch (error) {
            console.error('Failed to fetch flow:', error);
            toast.error('Failed to load flow details');
        }
    };

    const fetchProspects = async (newFilters: Filters = filters) => {
        if (!flowId) return;

        try {
            if (newFilters.page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await getFlowProspects(flowId, newFilters);

            if (response && response.status === 'success') {
                // Cast via unknown to ensure type safety matching the state
                const responseData = response.data as any;
                const newProspects = (responseData.prospects || []) as Prospect[];

                if (newFilters.page === 1) {
                    setProspects(newProspects);
                } else {
                    setProspects(prev => [...prev, ...newProspects]);
                }
                setPagination(responseData.pagination || null);
            }
        } catch (error) {
            console.error('Failed to fetch prospects:', error);
            toast.error('Failed to load prospects');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchProspects();
        setRefreshing(false);
        toast.success('Prospects refreshed');
    };

    const loadMore = () => {
        if (pagination?.hasNext && !loadingMore) {
            const newFilters: Filters = {
                ...filters,
                page: filters.page + 1
            };
            setFilters(newFilters);
            fetchProspects(newFilters);
        }
    };

    const toggleTopPicks = () => {
        const isTopPicks = filters.aiScore === 'top_picks';
        const newFilters: Filters = {
            ...filters,
            aiScore: isTopPicks ? '' : 'top_picks',
            page: 1
        };
        setFilters(newFilters);
        fetchProspects(newFilters);
    };

    const applyFilters = () => {
        const newFilters: Filters = {
            ...filters,
            page: 1
        };
        setFilters(newFilters);
        fetchProspects(newFilters);
    };

    const clearFilters = () => {
        const newFilters: Filters = {
            page: 1,
            limit: 20,
            status: '',
            search: '',
            aiScore: ''
        };
        setFilters(newFilters);
        fetchProspects(newFilters);
    };

    const toggleProspectExpansion = (prospectId: string) => {
        setExpandedProspect(expandedProspect === prospectId ? null : prospectId);
    };

    const getMatchQualityColor = (quality?: string) => {
        if (!quality) return 'text-gray-600 bg-gray-100 border-gray-200';

        switch (quality.toLowerCase()) {
            case 'hot':
                return 'text-red-600 bg-red-100 border-red-200';
            case 'warm':
                return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'cold':
                return 'text-blue-600 bg-blue-100 border-blue-200';
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getAIScoreColor = (score?: number) => {
        if (score === undefined) return 'text-gray-600';
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-blue-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const renderActivitiesTimeline = (activities?: Record<string, Activity[]>) => {
        if (!activities || Object.keys(activities).length === 0) {
            return (
                <div className="text-center py-4 text-gray-500">
                    No activities recorded
                </div>
            );
        }

        return Object.entries(activities).map(([activityType, activityList]) => (
            <div key={activityType} className="mb-3">
                <h4 className="font-medium text-gray-900 mb-2 capitalize">
                    {activityType.replace(/_/g, ' ').toLowerCase()}
                </h4>
                <div className="space-y-2">
                    {activityList.map((activity: Activity, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                            <span className="text-gray-700">{activity.message || activity.description}</span>
                            <span className="text-gray-500 text-xs">{formatDate(activity.timestamp)}</span>
                        </div>
                    ))}
                </div>
            </div>
        ));
    };

    const renderEngagements = (engagements?: Engagement[]) => {
        if (!engagements || engagements.length === 0) {
            return (
                <div className="text-center py-4 text-gray-500">
                    No engagements recorded
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {engagements.map((engagement: Engagement, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {engagement.type === 'POST_LIKED' ? (
                                    <Heart className="w-4 h-4 text-red-500" />
                                ) : (
                                    <MessageSquare className="w-4 h-4 text-blue-500" />
                                )}
                                <span className="font-medium text-gray-900">
                                    {engagement.type === 'POST_LIKED' ? 'Liked Post' : 'Commented on Post'}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(engagement.timestamp)}</span>
                        </div>

                        {engagement.postText && (
                            <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                "{engagement.postText}"
                            </p>
                        )}

                        {engagement.comment && (
                            <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                                <span className="font-medium">Comment:</span> "{engagement.comment}"
                            </p>
                        )}

                        {engagement.postUrl && (
                            <a
                                href={engagement.postUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                            >
                                View Post <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (loading && prospects.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (!flow) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Flow not found</h3>
                <p className="text-gray-600 mb-4">The requested flow could not be found.</p>
                <Link to="/flows">
                    <Flowbtn>Back to Flows</Flowbtn>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to={`/flows/${flowId}/analytics`}>
                        <Flowbtn variant="outline" size="sm" className="flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Analytics
                        </Flowbtn>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-black">Flow Prospects</h1>
                            <p className="text-gray-600 text-sm">{flow.name}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Flowbtn
                        onClick={handleRefresh}
                        variant="outline"
                        size="sm"
                        disabled={refreshing}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Flowbtn>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search prospects by name, company, or title..."
                                value={filters.search}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setFilters({ ...filters, search: e.target.value })
                                }
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-48">
                        <select
                            value={filters.status}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setFilters({ ...filters, status: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="ACCEPTED">Connected</option>
                            <option value="PENDING">Connection Pending</option>
                            <option value="DECLINED">Connection Declined</option>
                        </select>
                    </div>

                    <div className="w-full md:w-48">
                        <select
                            value={filters.aiScore || ''}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setFilters({ ...filters, aiScore: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All AI Scores</option>
                            <option value="qualified">Qualified ({'>'} 50)</option>
                            <option value="unqualified">Unqualified ({'<='} 50)</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <Flowbtn
                            onClick={toggleTopPicks}
                            size="sm"
                            variant={filters.aiScore === 'top_picks' ? 'primary' : 'outline'}
                            className="flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Top Prospects
                        </Flowbtn>
                        <Flowbtn onClick={applyFilters} size="sm" className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Apply
                        </Flowbtn>
                        <Flowbtn onClick={clearFilters} variant="outline" size="sm">
                            Clear
                        </Flowbtn>
                    </div>
                </div>
            </div>

            {/* Results Summary */}
            {pagination && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {Math.min((filters.page - 1) * filters.limit + 1, pagination.totalItems)}-
                        {Math.min(filters.page * filters.limit, pagination.totalItems)} of {pagination.totalItems} prospects
                    </div>
                    <div className="text-sm text-gray-600">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                </div>
            )}

            {/* Prospects List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {prospects.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No prospects found</h3>
                        <p className="text-gray-600">
                            {filters.search || filters.status
                                ? 'No prospects match your current filters.'
                                : 'No prospects have been found for this flow yet.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {prospects.map((prospect: Prospect) => (
                            <div key={prospect.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        {prospect.profileImage ? (
                                            <img
                                                src={prospect.profileImage}
                                                alt={prospect.name || 'Prospect'}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                                {prospect.name?.charAt(0) || '?'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {prospect.name || 'Unknown Prospect'}
                                                    </h3>
                                                    {prospect.aiScore !== undefined && (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getAIScoreColor(prospect.aiScore)}`}>
                                                            <Star className="w-3 h-3 fill-current" />
                                                            {prospect.aiScore}/100
                                                        </span>
                                                    )}
                                                    {prospect.matchQuality && (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getMatchQualityColor(prospect.matchQuality)}`}>
                                                            {prospect.matchQuality}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                                                    {prospect.title && (
                                                        <div className="flex items-center gap-1">
                                                            <Award className="w-3 h-3" />
                                                            <span>{prospect.title}</span>
                                                        </div>
                                                    )}
                                                    {prospect.company && (
                                                        <div className="flex items-center gap-1">
                                                            <Building className="w-3 h-3" />
                                                            <span>{prospect.company}</span>
                                                        </div>
                                                    )}
                                                    {prospect.location && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <span>{prospect.location}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                    {prospect.connection?.sentAt && (
                                                        <div className="flex items-center gap-1">
                                                            <UserPlus className="w-3 h-3" />
                                                            <span>Connected {formatDate(prospect.connection.sentAt)}</span>
                                                        </div>
                                                    )}
                                                    {prospect.engagements && prospect.engagements.length > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <Heart className="w-3 h-3" />
                                                            <span>{prospect.engagements.length} engagements</span>
                                                        </div>
                                                    )}
                                                    {prospect.recentPosts && prospect.recentPosts.length > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <TrendingUp className="w-3 h-3" />
                                                            <span>{prospect.recentPosts.length} recent posts</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => toggleProspectExpansion(prospect.id)}
                                                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                            >
                                                {expandedProspect === prospect.id ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedProspect === prospect.id && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                                                {/* Connection Details */}
                                                {prospect.connection && (
                                                    <div className="bg-blue-50 rounded-lg p-4">
                                                        <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                                                            <UserCheck className="w-4 h-4" />
                                                            Connection Details
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <p className="text-sm text-blue-800"><strong>Sent:</strong> {formatDate(prospect.connection.sentAt)}</p>
                                                                <p className="text-sm text-blue-800 mt-1"><strong>Message:</strong></p>
                                                                <p className="text-sm text-blue-800 bg-white p-2 rounded mt-1 whitespace-pre-wrap">
                                                                    {prospect.connection.message}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {prospect.connection.acceptedAt && (
                                                                    <div className="flex items-center gap-2 text-green-700">
                                                                        <UserCheck className="w-4 h-4" />
                                                                        <span>Connection Accepted: {formatDate(prospect.connection.acceptedAt)}</span>
                                                                    </div>
                                                                )}
                                                                {prospect.connection.declinedAt && (
                                                                    <div className="flex items-center gap-2 text-red-700">
                                                                        <UserX className="w-4 h-4" />
                                                                        <span>Connection Declined: {formatDate(prospect.connection.declinedAt)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Engagements */}
                                                {prospect.engagements && prospect.engagements.length > 0 && (
                                                    <div className="bg-purple-50 rounded-lg p-4">
                                                        <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                                                            <Heart className="w-4 h-4" />
                                                            Engagement Activities ({prospect.engagements.length})
                                                        </h4>
                                                        {renderEngagements(prospect.engagements)}
                                                    </div>
                                                )}

                                                {/* Recent Posts */}
                                                {prospect.recentPosts && prospect.recentPosts.length > 0 && (
                                                    <div className="bg-green-50 rounded-lg p-4">
                                                        <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                                                            <TrendingUp className="w-4 h-4" />
                                                            Recent Posts ({prospect.recentPosts.length})
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {prospect.recentPosts.slice(0, 3).map((post: Post, index: number) => (
                                                                <div key={index} className="border border-green-200 rounded-lg p-3">
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <span className="text-xs text-green-700 font-medium">
                                                                            {post.type?.replace(/_/g, ' ').toLowerCase() || 'Post'}
                                                                        </span>
                                                                        <span className="text-xs text-green-600">{formatDate(post.timestamp)}</span>
                                                                    </div>
                                                                    <p className="text-sm text-green-800 mb-2">
                                                                        {post.content || post.postText}
                                                                    </p>
                                                                    <div className="flex items-center gap-3 text-xs text-green-700">
                                                                        {post.engagement?.liked && (
                                                                            <span className="flex items-center gap-1">
                                                                                <Heart className="w-3 h-3 fill-current" />
                                                                                Liked
                                                                            </span>
                                                                        )}
                                                                        {post.engagement?.commented && (
                                                                            <span className="flex items-center gap-1">
                                                                                <MessageSquare className="w-3 h-3" />
                                                                                Commented
                                                                            </span>
                                                                        )}
                                                                        {post.metrics?.likesCount && post.metrics.likesCount > 0 && (
                                                                            <span className="flex items-center gap-1">
                                                                                <ThumbsUp className="w-3 h-3" />
                                                                                {post.metrics.likesCount} likes
                                                                            </span>
                                                                        )}
                                                                        {post.metrics?.commentsCount && post.metrics.commentsCount > 0 && (
                                                                            <span className="flex items-center gap-1">
                                                                                <MessageCircle className="w-3 h-3" />
                                                                                {post.metrics.commentsCount} comments
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {post.url && (
                                                                        <a
                                                                            href={post.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1 text-green-700 hover:text-green-900 text-sm mt-2"
                                                                        >
                                                                            View Post <ExternalLink className="w-3 h-3" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Match Information */}
                                                {prospect.matchReason && (
                                                    <div className="bg-yellow-50 rounded-lg p-4">
                                                        <h4 className="font-medium text-yellow-900 mb-2">Match Information</h4>
                                                        <p className="text-sm text-yellow-800">{prospect.matchReason}</p>
                                                        {prospect.relevanceFactors && (
                                                            <div className="mt-2">
                                                                <p className="text-sm text-yellow-800"><strong>Relevance Factors:</strong></p>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {Array.isArray(prospect.relevanceFactors) ? (
                                                                        prospect.relevanceFactors.map((factor: string, index: number) => (
                                                                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                                                                {factor}
                                                                            </span>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-xs text-yellow-800">{JSON.stringify(prospect.relevanceFactors)}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Profile Link */}
                                                {prospect.profileUrl && (
                                                    <div className="text-center">
                                                        <a
                                                            href={prospect.profileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 hover:text-gray-900 transition-colors"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            View LinkedIn Profile
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Load More Button */}
            {pagination?.hasNext && (
                <div className="flex justify-center">
                    <Flowbtn
                        onClick={loadMore}
                        disabled={loadingMore}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        {loadingMore ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Load More Prospects
                            </>
                        )}
                    </Flowbtn>
                </div>
            )}

            {/* End of Results */}
            {pagination && !pagination.hasNext && prospects.length > 0 && (
                <div className="text-center py-4 text-gray-500">
                    You've reached the end of the prospect list.
                </div>
            )}
        </div>
    );
};

export default FlowProspects;