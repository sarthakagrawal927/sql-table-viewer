import type { DataSet, SQLQuery, DBConnection } from '../types'
import employeesData from './datasets/employees.json'
import productsData from './datasets/products.json'
import salesData from './datasets/sales.json'
import departmentsData from './datasets/departments.json'
import projectsData from './datasets/projects.json'
import sampleQueriesData from './sampleQueries.json'

export const sampleDataSets: DataSet[] = [
  employeesData as DataSet,
  productsData as DataSet,
  salesData as DataSet,
  departmentsData as DataSet,
  projectsData as DataSet,
]

export const sampleQueries: SQLQuery[] = sampleQueriesData as SQLQuery[]

export const sampleConnections: DBConnection[] = [
  {
    id: 'conn-1',
    name: 'Production Database',
    type: 'postgresql',
    host: 'prod-db.company.com',
    port: 5432,
    database: 'main_app',
    username: 'app_user',
    status: 'connected',
    lastConnected: new Date('2024-01-15T10:30:00Z'),
    description: 'Main production PostgreSQL database',
    tables: ['users', 'orders', 'products', 'payments', 'inventory', 'reviews']
  },
  {
    id: 'conn-2',
    name: 'Analytics Warehouse',
    type: 'mysql',
    host: 'analytics.company.com',
    port: 3306,
    database: 'warehouse',
    username: 'analyst',
    status: 'connected',
    lastConnected: new Date('2024-01-15T09:15:00Z'),
    description: 'MySQL data warehouse for analytics',
    tables: ['sales_fact', 'customer_dim', 'product_dim', 'time_dim', 'metrics']
  },
  {
    id: 'conn-3',
    name: 'Local Development',
    type: 'sqlite',
    host: 'localhost',
    port: 0,
    database: '/Users/dev/app.db',
    username: 'local',
    status: 'disconnected',
    description: 'Local SQLite database for development',
    tables: ['test_users', 'mock_data', 'temp_results']
  },
  {
    id: 'conn-4',
    name: 'Cache Server',
    type: 'redis',
    host: 'cache.company.com',
    port: 6379,
    database: '0',
    username: 'cache_user',
    status: 'error',
    lastConnected: new Date('2024-01-14T16:45:00Z'),
    description: 'Redis cache server',
    tables: ['sessions', 'user_cache', 'query_cache', 'temp_data']
  },
  {
    id: 'conn-5',
    name: 'Document Store',
    type: 'mongodb',
    host: 'mongo.company.com',
    port: 27017,
    database: 'documents',
    username: 'doc_user',
    status: 'connected',
    lastConnected: new Date('2024-01-15T11:00:00Z'),
    description: 'MongoDB document database',
    tables: ['articles', 'media', 'comments', 'tags', 'categories']
  }
]
