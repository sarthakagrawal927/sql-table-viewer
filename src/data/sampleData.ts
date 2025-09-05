import type { DataSet, SQLQuery } from '../types'
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
