import { useCallback, useState } from "react";
import { CategoryWithCount, Link as LinkType } from "../types";

export type SelectedItemType = {
  type: "subcategory" | "link";
  item: CategoryWithCount | LinkType;
};

interface UseModalStateReturn {
  // Link modal state
  linkModalVisible: boolean;
  editingLink: LinkType | null;
  setLinkModalVisible: (visible: boolean) => void;
  setEditingLink: (link: LinkType | null) => void;
  openLinkModal: (link?: LinkType) => void;
  closeLinkModal: () => void;

  // Subcategory modal state
  subcategoryModalVisible: boolean;
  editingSubcategory: CategoryWithCount | null;
  setSubcategoryModalVisible: (visible: boolean) => void;
  setEditingSubcategory: (subcategory: CategoryWithCount | null) => void;
  openSubcategoryModal: (subcategory?: CategoryWithCount) => void;
  closeSubcategoryModal: () => void;

  // Add option modal state
  addOptionModalVisible: boolean;
  setAddOptionModalVisible: (visible: boolean) => void;
  openAddOptionModal: () => void;
  closeAddOptionModal: () => void;

  // Action modal state
  actionModalVisible: boolean;
  setActionModalVisible: (visible: boolean) => void;
  selectedItem: SelectedItemType | null;
  setSelectedItem: (item: SelectedItemType | null) => void;
  openActionModal: (item: SelectedItemType) => void;
  closeActionModal: () => void;

  // Delete modal state
  deleteModalVisible: boolean;
  setDeleteModalVisible: (visible: boolean) => void;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
}

export const useModalState = (): UseModalStateReturn => {
  // Link modal state
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);

  // Subcategory modal state
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);
  const [editingSubcategory, setEditingSubcategory] =
    useState<CategoryWithCount | null>(null);

  // Add option modal state
  const [addOptionModalVisible, setAddOptionModalVisible] = useState(false);

  // Action modal state
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItemType | null>(
    null,
  );

  // Delete modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Link modal handlers
  const openLinkModal = useCallback((link?: LinkType) => {
    if (link) {
      setEditingLink(link);
    } else {
      setEditingLink(null);
    }
    setLinkModalVisible(true);
  }, []);

  const closeLinkModal = useCallback(() => {
    setLinkModalVisible(false);
    setEditingLink(null);
  }, []);

  // Subcategory modal handlers
  const openSubcategoryModal = useCallback(
    (subcategory?: CategoryWithCount) => {
      if (subcategory) {
        setEditingSubcategory(subcategory);
      } else {
        setEditingSubcategory(null);
      }
      setSubcategoryModalVisible(true);
    },
    [],
  );

  const closeSubcategoryModal = useCallback(() => {
    setSubcategoryModalVisible(false);
    setEditingSubcategory(null);
  }, []);

  // Add option modal handlers
  const openAddOptionModal = useCallback(() => {
    setAddOptionModalVisible(true);
  }, []);

  const closeAddOptionModal = useCallback(() => {
    setAddOptionModalVisible(false);
  }, []);

  // Action modal handlers
  const openActionModal = useCallback((item: SelectedItemType) => {
    setSelectedItem(item);
    setActionModalVisible(true);
  }, []);

  const closeActionModal = useCallback(() => {
    setActionModalVisible(false);
    setSelectedItem(null);
  }, []);

  // Delete modal handlers
  const openDeleteModal = useCallback(() => {
    setDeleteModalVisible(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalVisible(false);
  }, []);

  return {
    // Link modal
    linkModalVisible,
    editingLink,
    setLinkModalVisible,
    setEditingLink,
    openLinkModal,
    closeLinkModal,

    // Subcategory modal
    subcategoryModalVisible,
    editingSubcategory,
    setSubcategoryModalVisible,
    setEditingSubcategory,
    openSubcategoryModal,
    closeSubcategoryModal,

    // Add option modal
    addOptionModalVisible,
    setAddOptionModalVisible,
    openAddOptionModal,
    closeAddOptionModal,

    // Action modal
    actionModalVisible,
    setActionModalVisible,
    selectedItem,
    setSelectedItem,
    openActionModal,
    closeActionModal,

    // Delete modal
    deleteModalVisible,
    setDeleteModalVisible,
    openDeleteModal,
    closeDeleteModal,
  };
};
