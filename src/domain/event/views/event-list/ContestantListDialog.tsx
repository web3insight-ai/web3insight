import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Avatar, Link, Button, Badge,
} from "@nextui-org/react";
import { MapPin, Calendar, ExternalLink, Users } from "lucide-react";

import AnalysisProgress from "@/components/loading/AnalysisProgress";

import type { ContestantListDialogProps } from "./typing";

function ContestantListDialog({ dataSource, visible, onClose, onGoto }: ContestantListDialogProps) {
  return (
    <Modal
      size="xl"
      backdrop="blur"
      isOpen={visible}
      isDismissable={false}
      isKeyboardDismissDisabled
      classNames={{
        closeButton: "hidden",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-primary" />
                  <span>Contestants</span>
                </div>
                <Badge color="primary" variant="flat">
                  {dataSource.length} user{dataSource.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Basic profiles loaded • Analysis in progress
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4 max-h-96 overflow-auto">
                {dataSource.map(user => (
                  <div className="flex gap-4 p-4 border border-border dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" key={user.id}>
                    <Link href={user.html_url} isExternal className="shrink-0">
                      <Avatar src={user.avatar_url} size="lg" className="ring-2 ring-border dark:ring-border-dark" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link 
                          href={user.html_url} 
                          isExternal 
                          className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-primary transition-colors"
                        >
                          {user.login}
                        </Link>
                        <ExternalLink size={14} className="text-gray-400" />
                      </div>
                      
                      {user.name && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          {user.name}
                        </div>
                      )}
                      
                      {user.bio && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                          {user.bio}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        {user.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{user.location}</span>
                          </div>
                        )}
                        {user.public_repos > 0 && (
                          <div className="flex items-center gap-1">
                            <span>{user.public_repos} repositories</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Joined {new Date(user.created_at).getFullYear()}</span>
                        </div>
                      </div>
                      
                      <AnalysisProgress 
                        status="analyzing" 
                        progress={Math.floor(Math.random() * 30) + 10} // Simulated progress
                        estimatedTime="2-3 minutes"
                        message="Analyzing contribution patterns..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="flex justify-between items-center w-full">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Analysis will continue in background
                </div>
                <div className="flex gap-2">
                  <Button variant="bordered" onClick={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onClick={onGoto}>
                    View Details
                  </Button>
                </div>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default ContestantListDialog;
