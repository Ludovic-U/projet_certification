import { Edge, Node } from "@xyflow/react";
import { Question } from "@/types/question";

type TreeNodeKind = "theme" | "question" | "response";

type ProjectResponse = {
	responseId?: number;
	questionId: number;
	label: string | null;
	keyword?: string | null;
};

type FlowNodeData = Question & {
	nodeKind?: TreeNodeKind;
	parentNodeId?: string | null;
	themeKey?: string;
	depth?: number;
	isVirtualRoot?: boolean;
	responseId?: number;
	isCollapsed?: boolean;
};

type BuildTreeLayoutParams = {
	initialNodes: Node[];
	initialEdges: Edge[];
	projectResponses: ProjectResponse[];
	revealByResponses: boolean;
	collapsedThemes: Set<string>;
};

type LayoutSide = "left" | "right";

type RTNode = {
	id: string;
	node: Node;
	parent: RTNode | null;
	children: RTNode[];
	ancestor: RTNode;
	thread: RTNode | null;
	prelim: number;
	mod: number;
	change: number;
	shift: number;
	number: number;
	depth: number;
	side: -1 | 1;
};

function cloneNodes(nodes: Node[]): Node[] {
	return nodes.map((node) => ({
		...node,
		position: { ...node.position },
		data: { ...(node.data as any) },
	}));
}

function buildRtSubtree(
	nodeId: string,
	side: -1 | 1,
	nodeById: Map<string, Node>,
	childrenByParent: Map<string, string[]>,
	visibleTreeNodeIds: Set<string>,
	parent: RTNode | null,
	depth: number,
	siblingNumber: number
): RTNode | null {
	const node = nodeById.get(nodeId);
	if (!node || !visibleTreeNodeIds.has(nodeId)) {
		return null;
	}

	const rtNode: RTNode = {
		id: nodeId,
		node,
		parent,
		children: [],
		ancestor: undefined as unknown as RTNode,
		thread: null,
		prelim: 0,
		mod: 0,
		change: 0,
		shift: 0,
		number: siblingNumber,
		depth,
		side,
	};

	rtNode.ancestor = rtNode;

	const childIds = childrenByParent.get(nodeId) || [];
	let visibleIndex = 1;
	childIds.forEach((childId) => {
		const child = buildRtSubtree(
			childId,
			side,
			nodeById,
			childrenByParent,
			visibleTreeNodeIds,
			rtNode,
			depth + 1,
			visibleIndex
		);
		if (!child) {
			return;
		}
		rtNode.children.push(child);
		visibleIndex += 1;
	});

	return rtNode;
}

function leftSibling(node: RTNode): RTNode | null {
	if (!node.parent || node.number <= 1) {
		return null;
	}
	return node.parent.children[node.number - 2] || null;
}

function nextLeft(node: RTNode | null): RTNode | null {
	if (!node) return null;
	return node.children.length > 0 ? node.children[0] : node.thread;
}

function nextRight(node: RTNode | null): RTNode | null {
	if (!node) return null;
	return node.children.length > 0 ? node.children[node.children.length - 1] : node.thread;
}

function moveSubtree(leftNode: RTNode, rightNode: RTNode, shift: number) {
	const subtrees = rightNode.number - leftNode.number;
	if (subtrees <= 0) {
		return;
	}

	rightNode.change -= shift / subtrees;
	rightNode.shift += shift;
	leftNode.change += shift / subtrees;
	rightNode.prelim += shift;
	rightNode.mod += shift;
}

function executeShifts(node: RTNode) {
	let shift = 0;
	let change = 0;

	for (let index = node.children.length - 1; index >= 0; index -= 1) {
		const child = node.children[index];
		child.prelim += shift;
		child.mod += shift;
		change += child.change;
		shift += child.shift + change;
	}
}

function ancestor(leftInner: RTNode, node: RTNode, defaultAncestor: RTNode): RTNode {
	if (leftInner.ancestor.parent?.id === node.parent?.id) {
		return leftInner.ancestor;
	}
	return defaultAncestor;
}

function apportion(node: RTNode, defaultAncestor: RTNode, distance: number): RTNode {
	const left = leftSibling(node);
	if (!left) {
		return defaultAncestor;
	}

	let rightInner: RTNode | null = node;
	let rightOuter: RTNode | null = node;
	let leftInner: RTNode | null = left;
	let leftOuter: RTNode | null = node.parent?.children[0] || null;

	let rightInnerMod = rightInner.mod;
	let rightOuterMod = rightOuter.mod;
	let leftInnerMod = leftInner.mod;
	let leftOuterMod = leftOuter?.mod || 0;

	while (nextRight(leftInner) && nextLeft(rightInner)) {
		leftInner = nextRight(leftInner);
		rightInner = nextLeft(rightInner);
		leftOuter = nextLeft(leftOuter);
		rightOuter = nextRight(rightOuter);

		if (!leftInner || !rightInner || !rightOuter) {
			break;
		}

		rightOuter.ancestor = node;

		const shift = leftInner.prelim + leftInnerMod - (rightInner.prelim + rightInnerMod) + distance;
		if (shift > 0) {
			moveSubtree(ancestor(leftInner, node, defaultAncestor), node, shift);
			rightInnerMod += shift;
			rightOuterMod += shift;
		}

		leftInnerMod += leftInner.mod;
		rightInnerMod += rightInner.mod;
		leftOuterMod += leftOuter?.mod || 0;
		rightOuterMod += rightOuter.mod;
	}

	if (nextRight(leftInner) && !nextRight(rightOuter)) {
		if (rightOuter) {
			rightOuter.thread = nextRight(leftInner);
			rightOuter.mod += leftInnerMod - rightOuterMod;
		}
	}

	if (nextLeft(rightInner) && !nextLeft(leftOuter)) {
		if (leftOuter) {
			leftOuter.thread = nextLeft(rightInner);
			leftOuter.mod += rightInnerMod - leftOuterMod;
		}
		defaultAncestor = node;
	}

	return defaultAncestor;
}

function firstWalk(node: RTNode, distance: number) {
	if (node.children.length === 0) {
		const left = leftSibling(node);
		node.prelim = left ? left.prelim + distance : 0;
		return;
	}

	let defaultAncestor = node.children[0];
	node.children.forEach((child) => {
		firstWalk(child, distance);
		defaultAncestor = apportion(child, defaultAncestor, distance);
	});

	executeShifts(node);

	const midpoint =
		(node.children[0].prelim + node.children[node.children.length - 1].prelim) / 2;
	const left = leftSibling(node);
	if (left) {
		node.prelim = left.prelim + distance;
		node.mod = node.prelim - midpoint;
	} else {
		node.prelim = midpoint;
	}
}

function secondWalk(node: RTNode, modSum: number, positions: Map<string, number>) {
	const y = node.prelim + modSum;
	positions.set(node.id, y);

	node.children.forEach((child) => {
		secondWalk(child, modSum + node.mod, positions);
	});
}

function collectRtNodes(root: RTNode, list: RTNode[] = []): RTNode[] {
	list.push(root);
	root.children.forEach((child) => collectRtNodes(child, list));
	return list;
}

function applyReingoldTilfordLayout({
	baseNodes,
	baseEdges,
	visibilityMap,
}: {
	baseNodes: Node[];
	baseEdges: Edge[];
	visibilityMap: Map<string, boolean>;
}) {
	const LEVEL_HORIZONTAL_GAP = 240;
	const LEVEL_VERTICAL_GAP = 95;
	const ROOT_ID = "virtual-root";

	const nodeById = new Map<string, Node>(baseNodes.map((node) => [node.id, node]));
	const rootNode = nodeById.get(ROOT_ID);
	const rootX = rootNode?.position.x ?? 0;

	const childrenByParent = new Map<string, string[]>();
	baseEdges.forEach((edge) => {
		const current = childrenByParent.get(edge.source) || [];
		current.push(edge.target);
		childrenByParent.set(edge.source, current);
	});

	childrenByParent.forEach((childIds, parentId) => {
		childIds.sort((a, b) => {
			const nodeA = nodeById.get(a);
			const nodeB = nodeById.get(b);
			if (!nodeA || !nodeB) return 0;
			return nodeA.position.y - nodeB.position.y;
		});
		childrenByParent.set(parentId, childIds);
	});

	const visibleTreeNodeIds = new Set<string>();
	baseNodes.forEach((node) => {
		const data = node.data as FlowNodeData;
		const isTreeNode = (data.nodeKind === "theme" || data.nodeKind === "question") && !data.isVirtualRoot;
		if (!isTreeNode) {
			return;
		}

		if (visibilityMap.get(node.id)) {
			visibleTreeNodeIds.add(node.id);
		}
	});

	const rootChildren = (childrenByParent.get(ROOT_ID) || []).filter((childId) =>
		visibleTreeNodeIds.has(childId)
	);

	const sideRoots = {
		left: [] as RTNode[],
		right: [] as RTNode[],
	};

	rootChildren.forEach((childId, index) => {
		const childNode = nodeById.get(childId);
		if (!childNode) {
			return;
		}

		const side: -1 | 1 = childNode.position.x < 0 ? -1 : 1;
		const subtree = buildRtSubtree(
			childId,
			side,
			nodeById,
			childrenByParent,
			visibleTreeNodeIds,
			null,
			1,
			index + 1
		);

		if (!subtree) {
			return;
		}

		if (side < 0) {
			sideRoots.left.push(subtree);
		} else {
			sideRoots.right.push(subtree);
		}
	});

	const applySide = (side: LayoutSide) => {
		const sideValue: -1 | 1 = side === "left" ? -1 : 1;
		const roots = sideRoots[side];
		if (roots.length === 0) {
			return;
		}

		const allNodes = roots.flatMap((root) => collectRtNodes(root));
		allNodes.forEach((node) => {
			node.children.forEach((child, index) => {
				child.number = index + 1;
			});
		});

		roots.forEach((root, index) => {
			root.number = index + 1;
			root.parent = null;
			root.ancestor = root;
			firstWalk(root, 1);
		});

		for (let index = 1; index < roots.length; index += 1) {
			const previous = roots[index - 1];
			const current = roots[index];
			const prevContour = new Map<number, number>();
			const currContour = new Map<number, number>();

			const fillContour = (
				node: RTNode,
				modSum: number,
				depth: number,
				collector: Map<number, number>,
				isLeftContour: boolean
			) => {
				const value = node.prelim + modSum;
				if (!collector.has(depth)) {
					collector.set(depth, value);
				} else {
					const currentValue = collector.get(depth) as number;
					collector.set(depth, isLeftContour ? Math.min(currentValue, value) : Math.max(currentValue, value));
				}

				node.children.forEach((child) =>
					fillContour(child, modSum + node.mod, depth + 1, collector, isLeftContour)
				);
			};

			fillContour(previous, 0, 0, prevContour, false);
			fillContour(current, 0, 0, currContour, true);

			let requiredShift = 0;
			currContour.forEach((leftValue, depth) => {
				const rightValue = prevContour.get(depth);
				if (rightValue === undefined) {
					return;
				}
				const localShift = rightValue - leftValue + 1;
				requiredShift = Math.max(requiredShift, localShift);
			});

			if (requiredShift > 0) {
				current.prelim += requiredShift;
				current.mod += requiredShift;
			}
		}

		const yByNodeId = new Map<string, number>();
		roots.forEach((root) => {
			secondWalk(root, 0, yByNodeId);
		});

		const visibleSideNodes = Array.from(yByNodeId.entries())
			.map(([id, yUnit]) => {
				const node = nodeById.get(id);
				if (!node) return null;
				return { node, yUnit };
			})
			.filter((entry): entry is { node: Node; yUnit: number } => Boolean(entry));

		if (visibleSideNodes.length === 0) {
			return;
		}

		const originalCenterY =
			visibleSideNodes.reduce((sum, entry) => sum + entry.node.position.y, 0) /
			visibleSideNodes.length;
		const computedCenterY =
			visibleSideNodes.reduce((sum, entry) => sum + entry.yUnit * LEVEL_VERTICAL_GAP, 0) /
			visibleSideNodes.length;
		const yOffset = originalCenterY - computedCenterY;

		allNodes.forEach((rtNode) => {
			const yUnit = yByNodeId.get(rtNode.id);
			if (yUnit === undefined) {
				return;
			}

			rtNode.node.position = {
				x: rootX + sideValue * (rtNode.depth * LEVEL_HORIZONTAL_GAP),
				y: yUnit * LEVEL_VERTICAL_GAP + yOffset,
			};
		});
	};

	applySide("left");
	applySide("right");
}

export function buildTreeSpatialLayout({
	initialNodes,
	initialEdges,
	projectResponses,
	revealByResponses,
	collapsedThemes,
}: BuildTreeLayoutParams): { nodes: Node[]; edges: Edge[] } {
	const RESPONSE_OFFSET_X = 230;
	const RESPONSE_OFFSET_Y = 30;
	const RESPONSE_VERTICAL_GAP = 70;
	const COLLISION_X_THRESHOLD = 160;
	const COLLISION_Y_THRESHOLD = 55;

	const responseMap = new Map<number, ProjectResponse>();
	projectResponses.forEach((response) => {
		responseMap.set(Number(response.questionId), response);
	});

	const baseNodes = cloneNodes(initialNodes);
	const baseEdges = [...initialEdges];

	const visibilityMap = new Map<string, boolean>();
	const nodeKindById = new Map<string, TreeNodeKind>();
	const questionNodesByQuestionId = new Map<number, Node>();

	baseNodes.forEach((node) => {
		const data = node.data as FlowNodeData;
		if (data.nodeKind) {
			nodeKindById.set(node.id, data.nodeKind);
		}
	});

	const orderedNodes = [...baseNodes].sort(
		(a, b) => Number((a.data as FlowNodeData).depth || 0) - Number((b.data as FlowNodeData).depth || 0)
	);

	orderedNodes.forEach((node) => {
		const data = node.data as FlowNodeData;

		if (data.isVirtualRoot) {
			node.hidden = false;
			visibilityMap.set(node.id, true);
			return;
		}

		const parentNodeId = data.parentNodeId || null;
		const parentVisible = parentNodeId ? visibilityMap.get(parentNodeId) ?? true : true;
		const parentIsTheme = parentNodeId ? nodeKindById.get(parentNodeId) === "theme" : false;
		const parentThemeCollapsed = parentIsTheme && parentNodeId ? collapsedThemes.has(parentNodeId) : false;

		if (data.nodeKind === "theme") {
			const isVisible = parentVisible && !parentThemeCollapsed;
			const isCollapsed = collapsedThemes.has(node.id);
			node.hidden = !isVisible;
			node.data = { ...data, isCollapsed };
			visibilityMap.set(node.id, isVisible);
		}
	});

	const questionNodes = baseNodes
		.filter((node) => {
			const data = node.data as FlowNodeData;
			const isQuestionNode = data.nodeKind === "question";
			const isThemeQuestionNode =
				data.nodeKind === "theme" && data.questionId !== undefined && data.questionId !== null;
			return (isQuestionNode || isThemeQuestionNode) && !data.isVirtualRoot;
		})
		.sort(
			(a, b) =>
				Number((a.data as FlowNodeData).depth || 0) - Number((b.data as FlowNodeData).depth || 0)
		);

	questionNodes.forEach((node) => {
		const data = node.data as FlowNodeData;
		const questionId = Number(data.questionId || data.id);
		const parentNodeId = data.parentNodeId || null;
		const parentVisible = parentNodeId ? visibilityMap.get(parentNodeId) ?? true : true;
		const parentIsQuestion = parentNodeId ? nodeKindById.get(parentNodeId) === "question" : false;
		const parentIsTheme = parentNodeId ? nodeKindById.get(parentNodeId) === "theme" : false;
		const parentQuestionId = parentIsQuestion ? Number(parentNodeId?.replace("q-", "")) : null;
		const parentHasResponse =
			parentQuestionId !== null ? responseMap.has(parentQuestionId) : true;
		const parentThemeCollapsed = parentIsTheme && parentNodeId ? collapsedThemes.has(parentNodeId) : false;
		const themeNodeId = data.themeKey ? `theme-${data.themeKey}` : null;
		const themeCollapsed = themeNodeId ? collapsedThemes.has(themeNodeId) : false;

		const isVisible =
			!parentThemeCollapsed &&
			!themeCollapsed &&
			parentVisible &&
			(!revealByResponses || !parentIsQuestion || parentHasResponse);

		const responseData = responseMap.get(questionId);
		const hasResponse = Boolean(responseData);
		const isSkipped = responseData?.label == null;

		node.hidden = !isVisible;
		node.data = {
			...data,
			status: hasResponse ? (isSkipped ? "skipped" : "answered") : "pending",
			keyword: data.keyword,
		};

		visibilityMap.set(node.id, isVisible);
		questionNodesByQuestionId.set(questionId, node);
	});

	applyReingoldTilfordLayout({
		baseNodes,
		baseEdges,
		visibilityMap,
	});

	if (revealByResponses) {
		type PendingResponsePlacement = {
			response: ProjectResponse;
			questionNode: Node;
			responseX: number;
			preferredY: number;
		};

		const leftPlacements: PendingResponsePlacement[] = [];
		const rightPlacements: PendingResponsePlacement[] = [];

		projectResponses.forEach((response) => {
			if (response.label == null || String(response.label).trim() === "") {
				return;
			}

			const questionNode = questionNodesByQuestionId.get(Number(response.questionId));
			if (!questionNode) {
				return;
			}

			const responseDirection: -1 | 1 = questionNode.position.x < 0 ? -1 : 1;
			const placement: PendingResponsePlacement = {
				response,
				questionNode,
				responseX: questionNode.position.x + RESPONSE_OFFSET_X * responseDirection,
				preferredY: questionNode.position.y + RESPONSE_OFFSET_Y,
			};

			if (responseDirection < 0) {
				leftPlacements.push(placement);
			} else {
				rightPlacements.push(placement);
			}
		});

		const placeSideResponses = (placements: PendingResponsePlacement[]) => {
			const occupiedResponsePositions: Array<{ x: number; y: number }> = [];
			const usedResponseNodeIds = new Set<string>();

			const hasCollision = (x: number, y: number) => {
				return occupiedResponsePositions.some(
					(position) =>
						Math.abs(position.x - x) < COLLISION_X_THRESHOLD &&
						Math.abs(position.y - y) < COLLISION_Y_THRESHOLD
				);
			};

			const getCenteredOffsets = (count: number) => {
				const middleIndex = (count - 1) / 2;
				return Array.from({ length: count }, (_, index) =>
					(index - middleIndex) * RESPONSE_VERTICAL_GAP
				);
			};

			const findGroupShift = (x: number, baseYs: number[]) => {
				const maxIterations = 100;
				for (let step = 0; step <= maxIterations; step += 1) {
					const deltas =
						step === 0
							? [0]
							: [step * RESPONSE_VERTICAL_GAP, -step * RESPONSE_VERTICAL_GAP];

					for (const delta of deltas) {
						const canPlaceGroup = baseYs.every((y) => !hasCollision(x, y + delta));
						if (canPlaceGroup) {
							return delta;
						}
					}
				}
				return 0;
			};

			const groupMap = new Map<string, PendingResponsePlacement[]>();

			placements.forEach((placement) => {
				const key = `${placement.questionNode.id}|${placement.responseX}|${placement.preferredY}`;
				const group = groupMap.get(key);
				if (group) {
					group.push(placement);
				} else {
					groupMap.set(key, [placement]);
				}
			});

			const groups = Array.from(groupMap.values()).sort(
				(a, b) => a[0].preferredY - b[0].preferredY
			);

			groups.forEach((group) => {
				const sortedGroup = [...group].sort((a, b) => {
					const responseIdA = Number(a.response.responseId ?? 0);
					const responseIdB = Number(b.response.responseId ?? 0);
					if (responseIdA !== responseIdB) {
						return responseIdA - responseIdB;
					}
					return String(a.response.label ?? "").localeCompare(String(b.response.label ?? ""));
				});

				const x = sortedGroup[0].responseX;
				const preferredY = sortedGroup[0].preferredY;
				const centeredOffsets = getCenteredOffsets(sortedGroup.length);
				const baseYs = centeredOffsets.map((offset) => preferredY + offset);
				const groupShift = findGroupShift(x, baseYs);

				sortedGroup.forEach((placement, index) => {
					const baseResponseNodeId = `r-${placement.response.responseId ?? placement.response.questionId}`;
					let responseNodeId = baseResponseNodeId;
					let suffix = 1;
					while (usedResponseNodeIds.has(responseNodeId)) {
						responseNodeId = `${baseResponseNodeId}-${suffix}`;
						suffix += 1;
					}

					usedResponseNodeIds.add(responseNodeId);

					const responseY = baseYs[index] + groupShift;
					occupiedResponsePositions.push({ x: placement.responseX, y: responseY });

					const responseNode: Node = {
						id: responseNodeId,
						type: "response",
						position: {
							x: placement.responseX,
							y: responseY,
						},
						data: {
							nodeKind: "response",
							label: placement.response.label,
							keyword: placement.response.keyword,
							responseId: placement.response.responseId,
							questionId: placement.response.questionId,
							parentNodeId: placement.questionNode.id,
						},
						hidden: placement.questionNode.hidden,
					};

					baseNodes.push(responseNode);
					baseEdges.push({
						id: `e-${placement.questionNode.id}-${responseNodeId}`,
						source: placement.questionNode.id,
						target: responseNodeId,
					});
				});
			});
		};

		placeSideResponses(leftPlacements);
		placeSideResponses(rightPlacements);
	}

	return { nodes: baseNodes, edges: baseEdges };
}

