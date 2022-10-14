import * as React from 'react'
import { Route, Routes } from 'react-router-dom'
import FeedListView from './components/FeedListView'
import FeedView from './components/FeedView'
import './Feed.scss'

const FeedsPage: React.FC = () => (
  <Routes>
    <Route path="/" element={<FeedListView />} />
    <Route path=":id" element={<FeedView />} />
  </Routes>
)

export default FeedsPage
