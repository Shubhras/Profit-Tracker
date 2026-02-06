import { Spin } from 'antd';
import React, { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Axios from './axios';
import Dashboard from './dashboard';
import Ecommerce from './ecommerce';
import Features from './features';
import Gallery from './gallery';
import Pages from './pages';
import Users from './users';
import Widgets from './widgets';
import ProfitRoutes from './profit';
import ReconcileRoutes from './reconcile';
import SettingsRoutes from './settings';
import withAdminLayout from '../../layout/withAdminLayout';
import SubscriptionGate from '../../components/utilities/SubscriptionGate';

const Charts = lazy(() => import('./charts'));
const KnowledgeBase = lazy(() => import('../../container/pages/knowledgeBase/Index'));
const AllArticle = lazy(() => import('../../container/pages/knowledgeBase/AllArticle'));
const KnowledgeSingle = lazy(() => import('../../container/pages/knowledgeBase/SingleKnowledge'));
const Components = lazy(() => import('./components'));
const Task = lazy(() => import('../../container/task/Index'));
const Tickets = lazy(() => import('../../container/supportTicket/Index'));
const AddTicket = lazy(() => import('../../container/supportTicket/AddSupport'));
const TicketDetails = lazy(() => import('../../container/supportTicket/SupportTicketDetails'));
const Courses = lazy(() => import('../../container/course/Index'));
const CourseDetails = lazy(() => import('../../container/course/CourseDetails'));
const Contact = lazy(() => import('../../container/contact/Contact'));
const ContactGrid = lazy(() => import('../../container/contact/ContactGrid'));
const ContactAddNew = lazy(() => import('../../container/contact/AddNew'));
const Calendars = lazy(() => import('../../container/calendar/Calendar'));
const Import = lazy(() => import('../../container/importExport/Import'));
const Export = lazy(() => import('../../container/importExport/Export'));
const ToDo = lazy(() => import('../../container/toDo/ToDo'));
const Note = lazy(() => import('../../container/note/Note'));
const Projects = lazy(() => import('./projects'));
const Myprofile = lazy(() => import('../../container/profile/myProfile/Index'));
const Chat = lazy(() => import('../../container/chat/ChatApp'));
const Inbox = lazy(() => import('../../container/email/Email'));
const Maps = lazy(() => import('./maps'));
const Editors = lazy(() => import('../../container/pages/Editor'));
const Icons = lazy(() => import('./icons'));
const Tables = lazy(() => import('./table'));
const Jobs = lazy(() => import('../../container/jobSearch/Jobs'));
const JobDetails = lazy(() => import('../../container/jobSearch/JobSearchDetails'));
const JobApply = lazy(() => import('../../container/jobSearch/JobApplication'));
const Firebase = lazy(() => import('./firestore'));
const NotFound = lazy(() => import('../../container/pages/404'));

const Admin = React.memo(() => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <Suspense
      fallback={
        <div className="spin flex items-center justify-center bg-white dark:bg-dark h-screen w-full fixed z-[999] ltr:left-0 rtl:right-0 top-0">
          <Spin />
        </div>
      }
    >
      <Routes>
        <Route
          index
          path="/*"
          element={
            <SubscriptionGate allowFree>
              <Dashboard />
            </SubscriptionGate>
          }
        />
        <Route
          path="profit/*"
          element={
            <SubscriptionGate allowFree>
              <ProfitRoutes />
            </SubscriptionGate>
          }
        />
        <Route
          path="reconcile/*"
          element={
            <SubscriptionGate>
              <ReconcileRoutes />
            </SubscriptionGate>
          }
        />
        <Route
          path="settings/*"
          element={
            <SubscriptionGate allowFree>
              <SettingsRoutes />
            </SubscriptionGate>
          }
        />
        <Route
          path="pages/*"
          element={
            <SubscriptionGate allowFree>
              <Pages />
            </SubscriptionGate>
          }
        />
        <Route
          path="gallery/*"
          element={
            <SubscriptionGate>
              <Gallery />
            </SubscriptionGate>
          }
        />
        <Route
          path="all-articles"
          element={
            <SubscriptionGate>
              <AllArticle />
            </SubscriptionGate>
          }
        />
        <Route
          path="knowledgeBase/*"
          element={
            <SubscriptionGate>
              <KnowledgeBase />
            </SubscriptionGate>
          }
        />
        <Route
          path="knowledgebaseSingle/:id"
          element={
            <SubscriptionGate>
              <KnowledgeSingle />
            </SubscriptionGate>
          }
        />
        <Route
          path="components/*"
          element={
            <SubscriptionGate>
              <Components />
            </SubscriptionGate>
          }
        />
        <Route
          path="charts/*"
          element={
            <SubscriptionGate>
              <Charts />
            </SubscriptionGate>
          }
        />
        <Route
          path="app/task/*"
          element={
            <SubscriptionGate>
              <Task />
            </SubscriptionGate>
          }
        />
        <Route
          path="users/*"
          element={
            <SubscriptionGate>
              <Users />
            </SubscriptionGate>
          }
        />
        <Route
          path="app/support/tickets/*"
          element={
            <SubscriptionGate>
              <Tickets />
            </SubscriptionGate>
          }
        />
        <Route
          path="app/support/tickets/add"
          element={
            <SubscriptionGate>
              <AddTicket />
            </SubscriptionGate>
          }
        />
        <Route
          path="app/support/ticketDetails/:id"
          element={
            <SubscriptionGate>
              <TicketDetails />
            </SubscriptionGate>
          }
        />
        <Route
          path="app/course/courseDetails/:id"
          element={
            <SubscriptionGate>
              <CourseDetails />
            </SubscriptionGate>
          }
        />
        <Route
          path="app/course/*"
          element={
            <SubscriptionGate>
              <Courses />
            </SubscriptionGate>
          }
        />
        <Route
          path="contact/list"
          element={
            <SubscriptionGate>
              <Contact />
            </SubscriptionGate>
          }
        />
        <Route
          path="contact/grid"
          element={
            <SubscriptionGate>
              <ContactGrid />
            </SubscriptionGate>
          }
        />
        <Route
          path="contact/addNew"
          element={
            <SubscriptionGate>
              <ContactAddNew />
            </SubscriptionGate>
          }
        />
        <Route
          path="app/calendar/*"
          element={
            <SubscriptionGate>
              <Calendars />
            </SubscriptionGate>
          }
        />
        <Route
          path="importExport/import"
          element={
            <SubscriptionGate>
              <Import />
            </SubscriptionGate>
          }
        />
        <Route
          path="importExport/export"
          element={
            <SubscriptionGate>
              <Export />
            </SubscriptionGate>
          }
        />
        <Route
          path="app/to-do"
          element={
            <SubscriptionGate>
              <ToDo />
            </SubscriptionGate>
          }
        />
        <Route
          path="app/note/*"
          element={
            <SubscriptionGate>
              <Note />
            </SubscriptionGate>
          }
        />
        <Route
          path="features/*"
          element={
            <SubscriptionGate>
              <Features />
            </SubscriptionGate>
          }
        />
        <Route
          path="axios/*"
          element={
            <SubscriptionGate>
              <Axios />
            </SubscriptionGate>
          }
        />
        <Route
          path="firestore/*"
          element={
            <SubscriptionGate>
              <Firebase />
            </SubscriptionGate>
          }
        />
        <Route
          path="project/*"
          element={
            <SubscriptionGate>
              <Projects />
            </SubscriptionGate>
          }
        />
        <Route
          path="profile/myProfile/*"
          element={
            <SubscriptionGate allowFree>
              <Myprofile />
            </SubscriptionGate>
          }
        />
        <Route
          path="ecommerce/*"
          element={
            <SubscriptionGate>
              <Ecommerce />
            </SubscriptionGate>
          }
        />
        <Route
          path="main/chat/*"
          element={
            <SubscriptionGate>
              <Chat />
            </SubscriptionGate>
          }
        />
        <Route
          path="email/*"
          element={
            <SubscriptionGate>
              <Inbox />
            </SubscriptionGate>
          }
        />
        <Route
          path="maps/*"
          element={
            <SubscriptionGate>
              <Maps />
            </SubscriptionGate>
          }
        />
        <Route
          path="editor"
          element={
            <SubscriptionGate>
              <Editors />
            </SubscriptionGate>
          }
        />
        <Route
          path="icons/*"
          element={
            <SubscriptionGate>
              <Icons />
            </SubscriptionGate>
          }
        />
        <Route
          path="tables/*"
          element={
            <SubscriptionGate>
              <Tables />
            </SubscriptionGate>
          }
        />
        <Route
          path="app/jobs/*"
          element={
            <SubscriptionGate>
              <Jobs />
            </SubscriptionGate>
          }
        />
        <Route
          path="app/job/apply"
          element={
            <SubscriptionGate>
              <JobApply />
            </SubscriptionGate>
          }
        />
        <Route
          path="app/jobDetails/:id"
          element={
            <SubscriptionGate>
              <JobDetails />
            </SubscriptionGate>
          }
        />
        <Route
          path="widgets/*"
          element={
            <SubscriptionGate>
              <Widgets />
            </SubscriptionGate>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
});

export default withAdminLayout(Admin);
